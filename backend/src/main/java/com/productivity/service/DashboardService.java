package com.productivity.service;

import com.productivity.dto.DashboardDTO;
import com.productivity.dto.HabitDTO;
import com.productivity.dto.TaskDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);
    private final TaskService taskService;
    private final HabitService habitService;

    public DashboardService(TaskService taskService, HabitService habitService) {
        this.taskService = taskService;
        this.habitService = habitService;
    }

    public DashboardDTO getDashboard(String userId) throws ExecutionException, InterruptedException {
        DashboardDTO dashboard = new DashboardDTO();

        // Task stats
        long total = taskService.getTaskCount(userId);
        dashboard.setTotalTasks(total);

        List<TaskDTO> allTasks = taskService.getTasks(userId, null, null, "createdAt", "desc", 0, 100);
        long completed = allTasks.stream().filter(t -> "done".equals(t.getStatus())).count();
        long inProgress = allTasks.stream().filter(t -> "in-progress".equals(t.getStatus())).count();

        dashboard.setCompletedTasks(completed);
        dashboard.setInProgressTasks(inProgress);

        // Today's tasks
        List<TaskDTO> todayTasks = taskService.getTodayTasks(userId);
        dashboard.setTodayTasks(todayTasks);

        // Overdue tasks
        List<TaskDTO> overdue = taskService.getOverdueTasks(userId);
        dashboard.setOverdueTasks(overdue.size());
        dashboard.setOverdueTodayTasks(overdue);

        // Upcoming deadlines (next 7 days of tasks)
        List<TaskDTO> upcoming = taskService.getTasks(userId, null, null, "deadline", "asc", 0, 10);
        List<TaskDTO> withDeadlines = upcoming.stream()
                .filter(t -> t.getDeadline() != null && !"done".equals(t.getStatus()))
                .toList();
        dashboard.setUpcomingDeadlines(withDeadlines);

        // Habits
        List<HabitDTO> habits = habitService.getHabits(userId);
        dashboard.setHabits(habits);

        int totalStreaks = habits.stream().mapToInt(HabitDTO::getCurrentStreak).sum();
        dashboard.setTotalStreakDays(totalStreaks);

        // Weekly stats (simplified — counts from all tasks/habits)
        DashboardDTO.WeeklyStats weeklyStats = new DashboardDTO.WeeklyStats();
        weeklyStats.setTasksCompleted((int) completed);
        weeklyStats.setHabitsCompleted((int) habits.stream().filter(h -> h.getLastCompletedDate() != null).count());
        weeklyStats.setStreakDays(totalStreaks);
        dashboard.setWeeklyStats(weeklyStats);

        return dashboard;
    }
}
