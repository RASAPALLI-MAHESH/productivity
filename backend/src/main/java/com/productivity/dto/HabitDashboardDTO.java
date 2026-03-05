package com.productivity.dto;

import java.util.List;
import java.util.Map;

public class HabitDashboardDTO {
    private List<HabitDTO> habits;
    private Map<String, List<HabitLogDTO>> logs; // Key: habitId, Value: list of logs (last 30 days)
    private HabitIntelligenceDTO intelligence;

    public HabitDashboardDTO() {}

    public HabitDashboardDTO(List<HabitDTO> habits, Map<String, List<HabitLogDTO>> logs, HabitIntelligenceDTO intelligence) {
        this.habits = habits;
        this.logs = logs;
        this.intelligence = intelligence;
    }

    public List<HabitDTO> getHabits() { return habits; }
    public void setHabits(List<HabitDTO> habits) { this.habits = habits; }
    public Map<String, List<HabitLogDTO>> getLogs() { return logs; }
    public void setLogs(Map<String, List<HabitLogDTO>> logs) { this.logs = logs; }
    public HabitIntelligenceDTO getIntelligence() { return intelligence; }
    public void setIntelligence(HabitIntelligenceDTO intelligence) { this.intelligence = intelligence; }
}
