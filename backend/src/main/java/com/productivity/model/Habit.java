package com.productivity.model;

import com.google.cloud.Timestamp;
import java.util.HashMap;
import java.util.Map;

public class Habit {
    private String id;
    private String userId;
    private String name;
    private String description;
    private String category;
    private String frequency;
    private String goalType;
    private int goalValue;
    private String motivation;
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
        this.category = (String) data.get("category");
        this.frequency = (String) data.get("frequency");
        this.goalType = (String) data.get("goalType");
        this.goalValue = data.get("goalValue") != null ? ((Number) data.get("goalValue")).intValue() : 0;
        this.motivation = (String) data.get("motivation");
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
        if (category != null) map.put("category", category);
        if (frequency != null) map.put("frequency", frequency);
        if (goalType != null) map.put("goalType", goalType);
        map.put("goalValue", goalValue);
        if (motivation != null) map.put("motivation", motivation);
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
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getGoalType() { return goalType; }
    public void setGoalType(String goalType) { this.goalType = goalType; }
    public int getGoalValue() { return goalValue; }
    public void setGoalValue(int goalValue) { this.goalValue = goalValue; }
    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }
    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }
    public String getLastCompletedDate() { return lastCompletedDate; }
    public void setLastCompletedDate(String lastCompletedDate) { this.lastCompletedDate = lastCompletedDate; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
