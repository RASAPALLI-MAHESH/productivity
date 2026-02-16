package com.productivity.model;

import com.google.cloud.Timestamp;
import java.util.HashMap;
import java.util.Map;

public class HabitLog {
    private String date; // YYYY-MM-DD (used as document ID)
    private boolean completed;
    private Timestamp completedAt;

    public HabitLog() {}

    public HabitLog(Map<String, Object> data, String date) {
        this.date = date;
        this.completed = data.get("completed") != null && (boolean) data.get("completed");
        this.completedAt = (Timestamp) data.get("completedAt");
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("date", date);
        map.put("completed", completed);
        if (completedAt != null) map.put("completedAt", completedAt);
        return map;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public Timestamp getCompletedAt() { return completedAt; }
    public void setCompletedAt(Timestamp completedAt) { this.completedAt = completedAt; }
}
