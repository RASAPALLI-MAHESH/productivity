package com.productivity.controller;

import com.productivity.config.AppProperties;
import com.productivity.dto.ApiResponse;
import com.productivity.dto.UserDTO;
import com.productivity.model.User;
import com.productivity.service.JwtService;
import com.productivity.service.OtpService;
import com.productivity.service.PasswordService;
import com.productivity.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Enterprise Auth Endpoints")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    private final UserService userService;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final PasswordService passwordService;
    private final AppProperties appProperties;

    public AuthController(UserService userService, JwtService jwtService, OtpService otpService, PasswordService passwordService, AppProperties appProperties) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.passwordService = passwordService;
        this.appProperties = appProperties;
    }

    // ─── Signup ─────────────────────────────────────────────────────────────
    @PostMapping("/signup")
    @Operation(summary = "Step 1: Create account & send OTP")
    public ResponseEntity<ApiResponse<Map<String, Object>>> signup(@RequestBody Map<String, String> body) 
            throws ExecutionException, InterruptedException {
        String email = body.get("email");
        String password = body.get("password");
        String displayName = body.get("displayName");
        
        // Check if user exists
        User existingUser = userService.findByEmail(email);
        if (existingUser != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Email already in use"));
        }
        
        // Create unverified user
        String passwordHash = passwordService.hashPassword(password);
        userService.createUser(email, passwordHash, displayName);
        
        // Send OTP
        String otp = otpService.generateOtp(email);
        
        Map<String, Object> data = new HashMap<>();
        data.put("maskedEmail", maskEmail(email));
        data.put("expiresInSeconds", 300);
        
        return ResponseEntity.ok(ApiResponse.success(data, "Account created. Please verify OTP."));
    }

    // ─── Resend OTP ─────────────────────────────────────────────────────────
    @PostMapping("/resend-otp")
    @Operation(summary = "Resend a new OTP to the user's email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resendOtp(@RequestBody Map<String, String> body) 
            throws ExecutionException, InterruptedException {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Email is required"));
        }

        User user = userService.findByEmail(email);
        if (user == null) {
            // Log warning but return success to prevent email enumeration
            log.warn("Resend OTP requested for non-existent email: {}", email);
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "maskedEmail", maskEmail(email),
                "expiresInSeconds", 300
            ), "If account exists, a new code has been sent."));
        }

        // Generate and send new OTP
        String otp = otpService.generateOtp(email);
        log.info("New OTP generated for: {}", email);

        Map<String, Object> data = new HashMap<>();
        data.put("maskedEmail", maskEmail(email));
        data.put("expiresInSeconds", 300);

        return ResponseEntity.ok(ApiResponse.success(data, "A fresh verification code has been sent."));
    }

    // ─── Verify OTP ─────────────────────────────────────────────────────────
    @PostMapping("/verify-otp")
    @Operation(summary = "Step 2: Verify OTP & Login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyOtp(@RequestBody Map<String, String> body, HttpServletResponse response) 
            throws ExecutionException, InterruptedException {
        String email = body.get("email");
        String otp = body.get("otp");
        
        if (!otpService.validateOtp(email, otp)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid or expired OTP"));
        }
        
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
        }
        
        // Mark verified if not already
        if (!user.isVerified()) {
            userService.verifyUser(user.getUid());
            user.setVerified(true);
        }
        
        // Generate tokens
        return generateTokensAndResponse(user, response);
    }
    
    // ─── Login ──────────────────────────────────────────────────────────────
    @PostMapping("/login")
    @Operation(summary = "Login with email & password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody Map<String, String> body, HttpServletResponse response) 
            throws ExecutionException, InterruptedException {
        String email = body.get("email");
        String password = body.get("password");
        
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid credentials"));
        }
        
        // Check lock
        if (user.getLockedUntil() != null && user.getLockedUntil().toDate().toInstant().isAfter(Instant.now())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account locked until " + user.getLockedUntil()));
        }
        
        // Check password
        if (!passwordService.checkPassword(password, user.getPasswordHash())) {
            // TODO: Increment login attempts & lock if > 5
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid credentials"));
        }
        
        userService.recordLogin(user.getUid());
        return generateTokensAndResponse(user, response);
    }

    // ─── Refresh Token ──────────────────────────────────────────────────────
    @PostMapping("/refresh")
    @Operation(summary = "Get new access token using httpOnly cookie")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refresh(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) 
            throws ExecutionException, InterruptedException {
        if (refreshToken == null || !jwtService.isTokenValid(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid refresh token"));
        }
        
        String uid = jwtService.extractUid(refreshToken);
        User user = userService.getUserModel(uid);
        
        // Refresh token rotation: generate new access AND new refresh token
        String newAccessToken = jwtService.generateAccessToken(uid, user.getRole());
        String newRefreshToken = jwtService.generateRefreshToken(uid);
        
        // Set new refresh cookie
        ResponseCookie cookie = ResponseCookie.from("refresh_token", newRefreshToken)
                .httpOnly(true)
                .secure(appProperties.getCookie().isSecure())
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("None") // Required for cross-domain (Vercel → Render)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        Map<String, Object> tokens = new HashMap<>();
        tokens.put("accessToken", newAccessToken);
        tokens.put("refreshToken", newRefreshToken);
        
        UserDTO userDTO = userService.getUser(uid);
        
        Map<String, Object> data = new HashMap<>();
        data.put("user", userDTO);
        data.put("tokens", tokens);
        
        return ResponseEntity.ok(ApiResponse.success(data, "Token refreshed"));
    }
    
    // ─── Logout ─────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(appProperties.getCookie().isSecure())
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }
    
    // ─── Forgot Password ────────────────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forgotPassword(@RequestBody Map<String, String> body) 
            throws ExecutionException, InterruptedException {
        String email = body.get("email");
        User user = userService.findByEmail(email);
        if (user == null) {
            // Don't reveal user existence
            return ResponseEntity.ok(ApiResponse.success(Map.of("maskedEmail", maskEmail(email), "expiresInSeconds", 300), "If exists, OTP sent"));
        }
        
        String otp = otpService.generateOtp(email);
        
        return ResponseEntity.ok(ApiResponse.success(Map.of("maskedEmail", maskEmail(email), "expiresInSeconds", 300), "OTP sent"));
    }
    
    // ─── Verify Reset OTP ──────────────────────────────────────────────────
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyResetOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        
        if (!otpService.validateOtp(email, otp)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Invalid OTP"));
        }
        
        // Return a temporary reset token (could be a short-lived JWT)
        // For simplicity, we'll just return success and trust the client to call reset immediately with the same OTP? 
        // No, that's insecure. We should generate a reset token.
        String resetToken = jwtService.generateAccessToken(email, "RESET_SCOPE"); // Using email as subject for reset token
        
        return ResponseEntity.ok(ApiResponse.success(Map.of("resetToken", resetToken), "OTP verified"));
    }
    
    // ─── Reset Password ─────────────────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> body) 
            throws ExecutionException, InterruptedException {
        String email = body.get("email");
        String newPassword = body.get("newPassword");
        String resetToken = body.get("resetToken");
        
        if (!jwtService.isTokenValid(resetToken)) {
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid reset token"));
        }
        
        // Verify token subject matches email
        if (!jwtService.extractUid(resetToken).equals(email)) {
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Token mismatch"));
        }

        User user = userService.findByEmail(email);
        if (user != null) {
            userService.updatePassword(user.getUid(), passwordService.hashPassword(newPassword));
        }
        
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    // ─── Helper ─────────────────────────────────────────────────────────────
    private ResponseEntity<ApiResponse<Map<String, Object>>> generateTokensAndResponse(User user, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(user.getUid(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getUid());
        
        // Set refresh cookie
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(appProperties.getCookie().isSecure())
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        Map<String, Object> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken); // Also return in body for mobile apps if needed
        tokens.put("expiresIn", 900); // 15m
        
        Map<String, Object> data = new HashMap<>();
        data.put("user", userService.toDTO(user));
        data.put("tokens", tokens);
        
        return ResponseEntity.ok(ApiResponse.success(data, "Login successful"));
    }
    
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf("@");
        if (atIndex <= 2) return email;
        return email.substring(0, 2) + "****" + email.substring(atIndex);
    }
}
