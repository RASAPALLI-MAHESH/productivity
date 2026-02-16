package com.productivity.model;

import com.google.cloud.Timestamp;
import java.util.HashMap;
import java.util.Map;

public class Task {
    private String id;
    private String userId;
    private String title;
    private String description;
    private String priority; // low, medium, high, critical
    private String status;   // todo, in-progress, done
    private Timestamp deadline;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Task() {}

    public Task(Map<String, Object> data, String id) {
        this.id = id;
        this.title = (String) data.get("title");
        this.description = (String) data.get("description");
        this.priority = (String) data.get("priority");
        this.status = (String) data.get("status");
        this.userId = (String) data.get("userId");
        this.deadline = (Timestamp) data.get("deadline");
        this.createdAt = (Timestamp) data.get("createdAt");
        this.updatedAt = (Timestamp) data.get("updatedAt");
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("title", title);
        map.put("description", description);
        map.put("priority", priority);
        map.put("status", status);
        map.put("userId", userId);
        if (deadline != null) map.put("deadline", deadline);
        if (createdAt != null) map.put("createdAt", createdAt);
        if (updatedAt != null) map.put("updatedAt", updatedAt);
        return map;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Timestamp getDeadline() { return deadline; }
    public void setDeadline(Timestamp deadline) { this.deadline = deadline; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
