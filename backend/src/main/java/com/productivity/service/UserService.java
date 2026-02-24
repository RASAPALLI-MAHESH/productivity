package com.productivity.service;

import com.google.cloud.Timestamp;
import com.productivity.dto.UserDTO;
import com.productivity.exception.ResourceNotFoundException;
import com.productivity.model.User;
import com.productivity.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO createOrUpdateUser(String uid, String email, String displayName, String photoURL)
            throws ExecutionException, InterruptedException {
        String normalizedEmail = email != null ? email.toLowerCase().trim() : null;
        User user = userRepository.findById(uid).orElse(null);

        if (user == null) {
            user = new User();
            user.setUid(uid);
            user.setEmail(normalizedEmail);
            user.setDisplayName(displayName);
            user.setPhotoURL(photoURL);
            user.setRole("user");
            user.setOnboarded(false);
            user.setVerified(false); // Default to false for new enterprise auth
            user.setCreatedAt(Timestamp.now());
            user.setUpdatedAt(Timestamp.now());
            userRepository.save(user);
            log.info("New user created: {}", uid);
        } else {
            Map<String, Object> updates = new HashMap<>();
            if (normalizedEmail != null) updates.put("email", normalizedEmail);
            if (displayName != null) updates.put("displayName", displayName);
            if (photoURL != null) updates.put("photoURL", photoURL);
            updates.put("updatedAt", Timestamp.now());
            userRepository.update(uid, updates);
            user = userRepository.findById(uid).orElseThrow();
            log.info("User updated: {}", uid);
        }

        return toDTO(user);
    }
    
    // New method for enterprise signup
    public User createUser(String email, String passwordHash, String displayName) 
            throws ExecutionException, InterruptedException {
        String normalizedEmail = email != null ? email.toLowerCase().trim() : null;
        String uid = UUID.randomUUID().toString();
        
        User user = new User();
        user.setUid(uid);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordHash);
        user.setDisplayName(displayName);
        user.setRole("user");
        user.setOnboarded(false);
        user.setVerified(false);
        user.setCreatedAt(Timestamp.now());
        user.setUpdatedAt(Timestamp.now());
        
        userRepository.save(user);
        log.info("Enterprise user created: {}", uid);
        return user;
    }
    
    public User findByEmail(String email) throws ExecutionException, InterruptedException {
        if (email == null) return null;
        String normalizedEmail = email.toLowerCase().trim();
        return userRepository.findByEmail(normalizedEmail).orElse(null);
    }

    public UserDTO getUser(String uid) throws ExecutionException, InterruptedException {
        User user = getUserModel(uid);
        return toDTO(user);
    }

    public User getUserModel(String uid) throws ExecutionException, InterruptedException {
        return userRepository.findById(uid)
                .orElseThrow(() -> new ResourceNotFoundException("User", uid));
    }

    public UserDTO completeOnboarding(String uid, String bio) throws ExecutionException, InterruptedException {
        Map<String, Object> updates = new HashMap<>();
        updates.put("bio", bio);
        updates.put("onboarded", true);
        updates.put("updatedAt", Timestamp.now());
        
        User user = userRepository.update(uid, updates);
        log.info("Onboarding completed for user: {}", uid);
        return toDTO(user);
    }
    
    public void verifyUser(String uid) throws ExecutionException, InterruptedException {
         Map<String, Object> updates = new HashMap<>();
         updates.put("verified", true);
         updates.put("updatedAt", Timestamp.now());
         userRepository.update(uid, updates);
    }
    
    public void recordLogin(String uid) throws ExecutionException, InterruptedException {
        Map<String, Object> updates = new HashMap<>();
        updates.put("lastLogin", Timestamp.now());
        updates.put("loginAttempts", 0);
        updates.put("lockedUntil", null);
        userRepository.update(uid, updates);
    }
    
    public void updatePassword(String uid, String newPasswordHash) throws ExecutionException, InterruptedException {
        Map<String, Object> updates = new HashMap<>();
        updates.put("passwordHash", newPasswordHash);
        updates.put("updatedAt", Timestamp.now());
        userRepository.update(uid, updates);
    }

    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUid(user.getUid());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
        dto.setPhotoURL(user.getPhotoURL());
        dto.setRole(user.getRole());
        dto.setOnboarded(user.isOnboarded());
        dto.setBio(user.getBio());
        
        dto.setVerified(user.isVerified());
        dto.setLoginAttempts(user.getLoginAttempts());
        if (user.getLockedUntil() != null) {
            dto.setLockedUntil(user.getLockedUntil().toDate().toInstant().toString());
        }
        if (user.getLastLogin() != null) {
            dto.setLastLogin(user.getLastLogin().toDate().toInstant().toString());
        }
        
        if (user.getCreatedAt() != null) {
            dto.setCreatedAt(user.getCreatedAt().toDate().toInstant().toString());
        }
        return dto;
    }
}
