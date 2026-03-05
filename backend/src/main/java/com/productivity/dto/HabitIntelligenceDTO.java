package com.productivity.dto;

public class HabitIntelligenceDTO {
    private int consistencyScore; // 0-100 based on weighted 30d completion
    private int riskCount;        // Number of habits missing 3+ days
    private int longestStreak;    // Max current streak across all habits
    private int weeklyCompletionRate; // % of habits completed in last 7 days vs expected

    public HabitIntelligenceDTO() {}

    public int getConsistencyScore() { return consistencyScore; }
    public void setConsistencyScore(int consistencyScore) { this.consistencyScore = consistencyScore; }
    public int getRiskCount() { return riskCount; }
    public void setRiskCount(int riskCount) { this.riskCount = riskCount; }
    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }
    public int getWeeklyCompletionRate() { return weeklyCompletionRate; }
    public void setWeeklyCompletionRate(int weeklyCompletionRate) { this.weeklyCompletionRate = weeklyCompletionRate; }
}
