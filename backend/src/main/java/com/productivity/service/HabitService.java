package com.productivity.service;

import com.google.cloud.Timestamp;
import com.productivity.dto.HabitDTO;
import com.productivity.dto.HabitLogDTO;
import com.productivity.exception.ResourceNotFoundException;
import com.productivity.model.Habit;
import com.productivity.model.HabitLog;
import com.productivity.repository.HabitLogRepository;
import com.productivity.repository.HabitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import com.productivity.dto.HabitDashboardDTO;
import com.productivity.dto.HabitIntelligenceDTO;

@Service
public class HabitService {

    private static final Logger log = LoggerFactory.getLogger(HabitService.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    public HabitService(HabitRepository habitRepository, HabitLogRepository habitLogRepository) {
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
    }

    public HabitDTO createHabit(String userId, HabitDTO dto) throws ExecutionException, InterruptedException {
        Habit habit = new Habit();
        habit.setName(dto.getName());
        habit.setDescription(dto.getDescription());
        habit.setCategory(dto.getCategory());
        habit.setFrequency(dto.getFrequency());
        habit.setGoalType(dto.getGoalType());
        habit.setGoalValue(dto.getGoalValue());
        habit.setMotivation(dto.getMotivation());
        habit.setCurrentStreak(0);
        habit.setLongestStreak(0);
        habit.setCreatedAt(Timestamp.now());

        Habit saved = habitRepository.save(userId, habit);
        return toDTO(saved);
    }

    public List<HabitDTO> getHabits(String userId) throws ExecutionException, InterruptedException {
        return habitRepository.findAll(userId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public HabitDTO getHabit(String userId, String habitId) throws ExecutionException, InterruptedException {
        Habit habit = habitRepository.findById(userId, habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));
        return toDTO(habit);
    }

    public HabitDTO updateHabit(String userId, String habitId, HabitDTO dto) throws ExecutionException, InterruptedException {
        Habit existing = habitRepository.findById(userId, habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));

        if (dto.getName() != null) existing.setName(dto.getName());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getCategory() != null) existing.setCategory(dto.getCategory());
        if (dto.getFrequency() != null) existing.setFrequency(dto.getFrequency());
        if (dto.getGoalType() != null) existing.setGoalType(dto.getGoalType());
        if (dto.getGoalValue() > 0) existing.setGoalValue(dto.getGoalValue());
        if (dto.getMotivation() != null) existing.setMotivation(dto.getMotivation());

        Habit saved = habitRepository.save(userId, existing);
        return toDTO(saved);
    }

    public void deleteHabit(String userId, String habitId) throws ExecutionException, InterruptedException {
        habitRepository.findById(userId, habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));
        habitRepository.delete(userId, habitId);
    }

    /**
     * Mark a habit as completed for today. Handles streak logic:
     * - If last completed was yesterday → increment streak
     * - If last completed was today → already done, return
     * - Otherwise → reset streak to 1 (missed day)
     */
    public HabitDTO completeHabit(String userId, String habitId) throws ExecutionException, InterruptedException {
        Habit habit = habitRepository.findById(userId, habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));

        String today = LocalDate.now().format(DATE_FORMAT);

        // Check if already completed today
        if (today.equals(habit.getLastCompletedDate())) {
            log.info("Habit {} already completed today for user {}", habitId, userId);
            return toDTO(habit);
        }

        // Save the log entry
        HabitLog logEntry = new HabitLog();
        logEntry.setDate(today);
        logEntry.setCompleted(true);
        logEntry.setCompletedAt(Timestamp.now());
        habitLogRepository.save(userId, habitId, logEntry);

        // Calculate streak
        if (habit.getLastCompletedDate() != null) {
            LocalDate lastDate = LocalDate.parse(habit.getLastCompletedDate(), DATE_FORMAT);
            long daysBetween = ChronoUnit.DAYS.between(lastDate, LocalDate.now());

            if (daysBetween == 1) {
                // Consecutive day — increment streak
                habit.setCurrentStreak(habit.getCurrentStreak() + 1);
            } else {
                // Missed day(s) — reset streak
                habit.setCurrentStreak(1);
            }
        } else {
            // First completion
            habit.setCurrentStreak(1);
        }

        // Update longest streak
        if (habit.getCurrentStreak() > habit.getLongestStreak()) {
            habit.setLongestStreak(habit.getCurrentStreak());
        }

        habit.setLastCompletedDate(today);
        Habit saved = habitRepository.save(userId, habit);
        return toDTO(saved);
    }

    public List<HabitLogDTO> getHabitLogs(String userId, String habitId, String startDate, String endDate)
            throws ExecutionException, InterruptedException {
        habitRepository.findById(userId, habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", habitId));

        return habitLogRepository.findByDateRange(userId, habitId, startDate, endDate)
                .stream().map(this::toLogDTO).collect(Collectors.toList());
    }

    public HabitDashboardDTO getDashboard(String userId) throws ExecutionException, InterruptedException {
        List<HabitDTO> habits = getHabits(userId);
        
        String endDate = LocalDate.now().format(DATE_FORMAT);
        String startDate = LocalDate.now().minusDays(30).format(DATE_FORMAT);
        
        Map<String, List<HabitLogDTO>> logs = new HashMap<>();
        for (HabitDTO h : habits) {
            logs.put(h.getId(), getHabitLogs(userId, h.getId(), startDate, endDate));
        }
        
        HabitIntelligenceDTO intelligence = computeIntelligence(habits, logs);
        
        return new HabitDashboardDTO(habits, logs, intelligence);
    }

    private HabitIntelligenceDTO computeIntelligence(List<HabitDTO> habits, Map<String, List<HabitLogDTO>> logsMap) {
        HabitIntelligenceDTO intel = new HabitIntelligenceDTO();
        if (habits.isEmpty()) return intel;
        
        LocalDate today = LocalDate.now();
        
        // 1. Consistency Score (last 30 days weighted)
        double weightedCompletion = 0;
        double totalWeight = 0;
        
        for (int i = 0; i < 30; i++) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.format(DATE_FORMAT);
            double weight = (30.0 - i) / 30.0;
            totalWeight += weight * habits.size();
            
            for (HabitDTO h : habits) {
                List<HabitLogDTO> hLogs = logsMap.get(h.getId());
                if (hLogs != null && hLogs.stream().anyMatch(l -> l.getDate().equals(dateStr) && l.isCompleted())) {
                    weightedCompletion += weight;
                }
            }
        }
        int consistency = totalWeight > 0 ? (int) Math.round((weightedCompletion / totalWeight) * 100) : 0;
        intel.setConsistencyScore(consistency);
        
        // 2. Risk Detection
        int riskCount = 0;
        String todayStr = today.format(DATE_FORMAT);
        String yesterdayStr = today.minusDays(1).format(DATE_FORMAT);
        
        for (HabitDTO h : habits) {
            if ("daily".equals(h.getFrequency()) || h.getFrequency() == null) {
                if (h.getCurrentStreak() > 0 && !todayStr.equals(h.getLastCompletedDate()) && !yesterdayStr.equals(h.getLastCompletedDate())) {
                    riskCount++;
                }
            }
        }
        intel.setRiskCount(riskCount);
        
        // 3. Longest Streak
        int maxStreak = habits.stream().mapToInt(HabitDTO::getCurrentStreak).max().orElse(0);
        intel.setLongestStreak(maxStreak);
        
        // 4. Weekly Completion Rate
        int weeklyCompleted = 0;
        int weeklyExpected = habits.size() * 7;
        for (int i = 0; i < 7; i++) {
            String dateStr = today.minusDays(i).format(DATE_FORMAT);
            for (HabitDTO h : habits) {
                List<HabitLogDTO> hLogs = logsMap.get(h.getId());
                if (hLogs != null && hLogs.stream().anyMatch(l -> l.getDate().equals(dateStr) && l.isCompleted())) {
                    weeklyCompleted++;
                }
            }
        }
        int weeklyRate = weeklyExpected > 0 ? (int) Math.round((weeklyCompleted * 100.0) / weeklyExpected) : 0;
        intel.setWeeklyCompletionRate(weeklyRate);
        
        return intel;
    }

    private HabitDTO toDTO(Habit habit) {
        HabitDTO dto = new HabitDTO();
        dto.setId(habit.getId());
        dto.setName(habit.getName());
        dto.setDescription(habit.getDescription());
        dto.setCategory(habit.getCategory());
        dto.setFrequency(habit.getFrequency());
        dto.setGoalType(habit.getGoalType());
        dto.setGoalValue(habit.getGoalValue());
        dto.setMotivation(habit.getMotivation());
        dto.setCurrentStreak(habit.getCurrentStreak());
        dto.setLongestStreak(habit.getLongestStreak());
        dto.setLastCompletedDate(habit.getLastCompletedDate());
        if (habit.getCreatedAt() != null) {
            dto.setCreatedAt(habit.getCreatedAt().toDate().toInstant().toString());
        }
        return dto;
    }

    private HabitLogDTO toLogDTO(HabitLog log) {
        HabitLogDTO dto = new HabitLogDTO();
        dto.setDate(log.getDate());
        dto.setCompleted(log.isCompleted());
        if (log.getCompletedAt() != null) {
            dto.setCompletedAt(log.getCompletedAt().toDate().toInstant().toString());
        }
        return dto;
    }
}
