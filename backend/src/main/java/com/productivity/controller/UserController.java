package com.productivity.controller;

import com.productivity.dto.ApiResponse;
import com.productivity.dto.UserDTO;
import com.productivity.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User profile endpoints")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile(Authentication auth)
            throws ExecutionException, InterruptedException {
        String uid = (String) auth.getPrincipal();
        UserDTO user = userService.getUser(uid);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/onboarding")
    @Operation(summary = "Complete user onboarding")
    public ResponseEntity<ApiResponse<UserDTO>> completeOnboarding(
            Authentication auth,
            @RequestBody java.util.Map<String, String> body) throws ExecutionException, InterruptedException {
        String uid = (String) auth.getPrincipal();
        String bio = body.get("bio");
        UserDTO user = userService.completeOnboarding(uid, bio);
        return ResponseEntity.ok(ApiResponse.success(user, "Onboarding completed"));
    }
}
