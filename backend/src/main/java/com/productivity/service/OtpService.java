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
    
    private final EmailService emailService;
    
    // In-memory store for now (ConcurrentHashMap). Replace with Redis in production.
    // Key: email, Value: OtpData
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor = Executors.newSingleThreadScheduledExecutor();

    public OtpService(EmailService emailService) {
        this.emailService = emailService;
        // Periodic cleanup every minute
        cleanupExecutor.scheduleAtFixedRate(this::removeExpiredOtps, 1, 1, TimeUnit.MINUTES);
    }

    public String generateOtp(String email) {
        String otp = generateNumericOtp();
        long expiryTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(OTP_EXPIRATION_MINUTES);
        otpStore.put(email, new OtpData(otp, expiryTime));
        
        // Send via EmailService
        String subject = "Your Verification Code: " + otp;
        String htmlContent = "<html><body><h1>Your code is " + otp + "</h1><p>This code expires in 5 minutes.</p></body></html>";
        
        try {
            emailService.sendHtmlMessage(email, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send OTP email: {}", e.getMessage());
        }
        
        return otp;
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
