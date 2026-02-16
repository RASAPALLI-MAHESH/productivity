package com.productivity.dto;

public class HabitLogDTO {
    private String date;
    private boolean completed;
    private String completedAt;

    public HabitLogDTO() {}

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
}
