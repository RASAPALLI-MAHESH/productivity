package com.productivity.model;

import com.google.cloud.Timestamp;
import java.util.HashMap;
import java.util.Map;

public class Habit {
    private String id;
    private String userId;
    private String name;
    private String description;
    private int currentStreak;
    private int longestStreak;
    private String lastCompletedDate; // YYYY-MM-DD
    private Timestamp createdAt;

    public Habit() {}

    public Habit(Map<String, Object> data, String id) {
        this.id = id;
        this.name = (String) data.get("name");
        this.description = (String) data.get("description");
        this.userId = (String) data.get("userId");
        this.currentStreak = data.get("currentStreak") != null ? ((Number) data.get("currentStreak")).intValue() : 0;
        this.longestStreak = data.get("longestStreak") != null ? ((Number) data.get("longestStreak")).intValue() : 0;
        this.lastCompletedDate = (String) data.get("lastCompletedDate");
        this.createdAt = (Timestamp) data.get("createdAt");
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("description", description);
        map.put("userId", userId);
        map.put("currentStreak", currentStreak);
        map.put("longestStreak", longestStreak);
        if (lastCompletedDate != null) map.put("lastCompletedDate", lastCompletedDate);
        if (createdAt != null) map.put("createdAt", createdAt);
        return map;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }
    public String getLastCompletedDate() { return lastCompletedDate; }
    public void setLastCompletedDate(String lastCompletedDate) { this.lastCompletedDate = lastCompletedDate; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
