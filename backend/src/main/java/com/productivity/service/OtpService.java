package com.productivity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION_MINUTES = 5;
    
    @Value("${otp.api.url}")
    private String apiUrl;
    
    @Value("${otp.api.key}")
    private String apiKey;

    @Value("${otp.api.sender}")
    private String senderId;

    private final RestTemplate restTemplate = new RestTemplate();
    
    // In-memory store for now (ConcurrentHashMap). Replace with Redis in production.
    // Key: email, Value: OtpData
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor = Executors.newSingleThreadScheduledExecutor();

    public OtpService() {
        // Periodic cleanup every minute
        cleanupExecutor.scheduleAtFixedRate(this::removeExpiredOtps, 1, 1, TimeUnit.MINUTES);
    }

    public String generateOtp(String email) {
        String otp = generateNumericOtp();
        long expiryTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(OTP_EXPIRATION_MINUTES);
        otpStore.put(email, new OtpData(otp, expiryTime));
        
        // Try sending via API
        try {
            sendOtpViaApi(email, otp);
        } catch (Exception e) {
            log.error("Failed to send OTP via API: {}", e.getMessage());
            // Fallback to log for dev/test
            log.info("--------------------------------------------------");
            log.info("OTP for {}: {}", email, otp);
            log.info("--------------------------------------------------");
        }
        
        return otp;
    }

    private void sendOtpViaApi(String email, String otp) {
        if (apiUrl == null || apiUrl.contains("example.com")) {
            // Auto-detect Brevo URL if key is present
            if (apiKey != null && apiKey.startsWith("xkeysib")) {
                apiUrl = "https://api.brevo.com/v3/smtp/email";
                log.info("Auto-detected Brevo API Key. Using Brevo URL: {}", apiUrl);
            } else {
                log.info("OTP API URL not configured, skipping external call. OTP: {}", otp);
                return;
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        // Construct Brevo-compliant Payload
        Map<String, Object> body = new HashMap<>();
        
        // Sender
        Map<String, String> sender = new HashMap<>();
        sender.put("name", senderId != null ? senderId : "ProductivApp");
        sender.put("email", "no-reply@productiv.app"); // Brevo requires a sender email
        body.put("sender", sender);

        // To
        Map<String, String> to = new HashMap<>();
        to.put("email", email);
        body.put("to", java.util.Collections.singletonList(to));

        // Subject & Content
        body.put("subject", "Your Verification Code: " + otp);
        body.put("htmlContent", "<html><body><h1>Your code is " + otp + "</h1><p>This code expires in 5 minutes.</p></body></html>");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        try {
            restTemplate.postForObject(apiUrl, request, String.class);
            log.info("OTP sent to {} via Brevo API", email);
        } catch (Exception e) {
            log.error("Error calling OTP API: {}", e.getMessage());
            throw e; 
        }
    }

    public boolean validateOtp(String email, String otp) {
        OtpData data = otpStore.get(email);
        if (data == null) return false;
        
        if (System.currentTimeMillis() > data.expiryTime) {
            otpStore.remove(email);
            return false;
        }
        
        if (data.otp.equals(otp)) {
            otpStore.remove(email); // OTP acts as one-time
            return true;
        }
        
        return false;
    }
    
    private String generateNumericOtp() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(1000000); // 0 to 999999
        return String.format("%06d", num);
    }
    
    private void removeExpiredOtps() {
        long now = System.currentTimeMillis();
        otpStore.entrySet().removeIf(entry -> now > entry.getValue().expiryTime);
    }

    private static class OtpData {
        final String otp;
        final long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}
