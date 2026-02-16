package com.productivity.model;

import com.google.cloud.Timestamp;
import java.util.HashMap;
import java.util.Map;

public class User {
    private String uid;
    private String email;
    private String displayName;
    private String photoURL;
    private String role; // user, admin
    private boolean onboarded;
    private String bio;
    
    // Enterprise Auth Fields
    private String passwordHash;
    private boolean verified;
    private int loginAttempts;
    private Timestamp lockedUntil;
    private Timestamp lastLogin;

    private Timestamp createdAt;
    private Timestamp updatedAt;

    public User() {}

    public User(Map<String, Object> data, String uid) {
        this.uid = uid;
        this.email = (String) data.get("email");
        this.displayName = (String) data.get("displayName");
        this.photoURL = (String) data.get("photoURL");
        this.role = (String) data.getOrDefault("role", "user");
        this.onboarded = data.get("onboarded") != null && (boolean) data.get("onboarded");
        this.bio = (String) data.get("bio");
        
        this.passwordHash = (String) data.get("passwordHash");
        this.verified = data.get("verified") != null && (boolean) data.get("verified");
        this.loginAttempts = data.get("loginAttempts") != null ? ((Long) data.get("loginAttempts")).intValue() : 0;
        this.lockedUntil = (Timestamp) data.get("lockedUntil");
        this.lastLogin = (Timestamp) data.get("lastLogin");

        this.createdAt = (Timestamp) data.get("createdAt");
        this.updatedAt = (Timestamp) data.get("updatedAt");
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("email", email);
        map.put("displayName", displayName);
        map.put("photoURL", photoURL);
        map.put("role", role);
        map.put("onboarded", onboarded);
        if (bio != null) map.put("bio", bio);
        
        if (passwordHash != null) map.put("passwordHash", passwordHash);
        map.put("verified", verified);
        map.put("loginAttempts", loginAttempts);
        if (lockedUntil != null) map.put("lockedUntil", lockedUntil);
        if (lastLogin != null) map.put("lastLogin", lastLogin);

        if (createdAt != null) map.put("createdAt", createdAt);
        if (updatedAt != null) map.put("updatedAt", updatedAt);
        return map;
    }

    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getPhotoURL() { return photoURL; }
    public void setPhotoURL(String photoURL) { this.photoURL = photoURL; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isOnboarded() { return onboarded; }
    public void setOnboarded(boolean onboarded) { this.onboarded = onboarded; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public int getLoginAttempts() { return loginAttempts; }
    public void setLoginAttempts(int loginAttempts) { this.loginAttempts = loginAttempts; }
    public Timestamp getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(Timestamp lockedUntil) { this.lockedUntil = lockedUntil; }
    public Timestamp getLastLogin() { return lastLogin; }
    public void setLastLogin(Timestamp lastLogin) { this.lastLogin = lastLogin; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
