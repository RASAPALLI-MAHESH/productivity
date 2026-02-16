package com.productivity.dto;

import java.util.List;

public class DashboardDTO {
    private long totalTasks;
    private long completedTasks;
    private long overdueTasks;
    private long inProgressTasks;
    private List<TaskDTO> todayTasks;
    private List<TaskDTO> overdueTodayTasks;
    private List<HabitDTO> habits;
    private int totalStreakDays;
    private List<TaskDTO> upcomingDeadlines;
    private WeeklyStats weeklyStats;

    public static class WeeklyStats {
        private int tasksCompleted;
        private int habitsCompleted;
        private int streakDays;

        public int getTasksCompleted() { return tasksCompleted; }
        public void setTasksCompleted(int tasksCompleted) { this.tasksCompleted = tasksCompleted; }
        public int getHabitsCompleted() { return habitsCompleted; }
        public void setHabitsCompleted(int habitsCompleted) { this.habitsCompleted = habitsCompleted; }
        public int getStreakDays() { return streakDays; }
        public void setStreakDays(int streakDays) { this.streakDays = streakDays; }
    }

    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
    public long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }
    public long getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(long overdueTasks) { this.overdueTasks = overdueTasks; }
    public long getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(long inProgressTasks) { this.inProgressTasks = inProgressTasks; }
    public List<TaskDTO> getTodayTasks() { return todayTasks; }
    public void setTodayTasks(List<TaskDTO> todayTasks) { this.todayTasks = todayTasks; }
    public List<TaskDTO> getOverdueTodayTasks() { return overdueTodayTasks; }
    public void setOverdueTodayTasks(List<TaskDTO> overdueTodayTasks) { this.overdueTodayTasks = overdueTodayTasks; }
    public List<HabitDTO> getHabits() { return habits; }
    public void setHabits(List<HabitDTO> habits) { this.habits = habits; }
    public int getTotalStreakDays() { return totalStreakDays; }
    public void setTotalStreakDays(int totalStreakDays) { this.totalStreakDays = totalStreakDays; }
    public List<TaskDTO> getUpcomingDeadlines() { return upcomingDeadlines; }
    public void setUpcomingDeadlines(List<TaskDTO> upcomingDeadlines) { this.upcomingDeadlines = upcomingDeadlines; }
    public WeeklyStats getWeeklyStats() { return weeklyStats; }
    public void setWeeklyStats(WeeklyStats weeklyStats) { this.weeklyStats = weeklyStats; }
}
