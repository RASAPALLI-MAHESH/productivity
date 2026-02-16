package com.productivity.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.service-account-path}")
    private String serviceAccountPath;

    @Value("${firebase.project-id}")
    private String projectId;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder()
                        .setProjectId(projectId);

                // Check for environment variable first (Cloud/Render deployment)
                String envCredentials = System.getenv("FIREBASE_CREDENTIALS");
                if (envCredentials != null && !envCredentials.isEmpty()) {
                    log.info("Loading Firebase credentials from Environment Variable");
                    optionsBuilder.setCredentials(GoogleCredentials.fromStream(
                            new java.io.ByteArrayInputStream(envCredentials.getBytes())));
                } else {
                    // Fallback to file path (Local development)
                    log.info("Loading Firebase credentials from file: {}", serviceAccountPath);
                    FileInputStream serviceAccount = new FileInputStream(serviceAccountPath);
                    optionsBuilder.setCredentials(GoogleCredentials.fromStream(serviceAccount));
                }

                FirebaseApp.initializeApp(optionsBuilder.build());
                log.info("Firebase initialized successfully for project: {}", projectId);
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase: {}", e.getMessage());
            throw new RuntimeException("Firebase initialization failed", e);
        }
    }

    @Bean
    public Firestore firestore() {
        return FirestoreClient.getFirestore();
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        return FirebaseAuth.getInstance();
    }
}
