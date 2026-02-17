package com.productivity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${spring.mail.from}")
    private String senderEmail;

    @Async
    public void sendSimpleMessage(String to, String subject, String text) {
        sendHtmlMessage(to, subject, "<html><body>" + text + "</body></html>");
    }

    @Async
    public void sendHtmlMessage(String to, String subject, String htmlBody) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("your-brevo-smtp-key")) {
            log.warn("Brevo API Key not configured. Skipping email to {}", to);
            return;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        // Construct Payload
        Map<String, Object> body = new HashMap<>();
        
        // Sender
        Map<String, String> sender = new HashMap<>();
        sender.put("name", "ProductivApp");
        sender.put("email", senderEmail);
        body.put("sender", sender);

        // To
        Map<String, String> receiver = new HashMap<>();
        receiver.put("email", to);
        body.put("to", Collections.singletonList(receiver));

        // Content
        body.put("subject", subject);
        body.put("htmlContent", htmlBody);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        try {
            restTemplate.postForObject(BREVO_API_URL, request, String.class);
            log.info("Email sent to {} via Brevo API", to);
        } catch (Exception e) {
            log.error("Failed to send email to {} via Brevo API: {}", to, e.getMessage());
        }
    }
}
