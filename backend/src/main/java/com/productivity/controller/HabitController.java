package com.productivity.controller;

import com.productivity.dto.ApiResponse;
import com.productivity.dto.HabitDTO;
import com.productivity.dto.HabitLogDTO;
import com.productivity.service.HabitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/v1/habits")
@Tag(name = "Habits", description = "Habit tracking endpoints")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @PostMapping
    @Operation(summary = "Create a new habit")
    public ResponseEntity<ApiResponse<HabitDTO>> createHabit(
            Authentication auth,
            @Valid @RequestBody HabitDTO habitDTO) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        HabitDTO created = habitService.createHabit(userId, habitDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Habit created"));
    }

    @GetMapping
    @Operation(summary = "List all habits")
    public ResponseEntity<ApiResponse<List<HabitDTO>>> getHabits(Authentication auth)
            throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        List<HabitDTO> habits = habitService.getHabits(userId);
        return ResponseEntity.ok(ApiResponse.success(habits));
    }

    @GetMapping("/{habitId}")
    @Operation(summary = "Get a habit by ID")
    public ResponseEntity<ApiResponse<HabitDTO>> getHabit(
            Authentication auth,
            @PathVariable String habitId) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        HabitDTO habit = habitService.getHabit(userId, habitId);
        return ResponseEntity.ok(ApiResponse.success(habit));
    }

    @PutMapping("/{habitId}")
    @Operation(summary = "Update a habit")
    public ResponseEntity<ApiResponse<HabitDTO>> updateHabit(
            Authentication auth,
            @PathVariable String habitId,
            @Valid @RequestBody HabitDTO habitDTO) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        HabitDTO updated = habitService.updateHabit(userId, habitId, habitDTO);
        return ResponseEntity.ok(ApiResponse.success(updated, "Habit updated"));
    }

    @DeleteMapping("/{habitId}")
    @Operation(summary = "Delete a habit")
    public ResponseEntity<ApiResponse<Void>> deleteHabit(
            Authentication auth,
            @PathVariable String habitId) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        habitService.deleteHabit(userId, habitId);
        return ResponseEntity.ok(ApiResponse.success(null, "Habit deleted"));
    }

    @PostMapping("/{habitId}/complete")
    @Operation(summary = "Mark a habit as completed for today")
    public ResponseEntity<ApiResponse<HabitDTO>> completeHabit(
            Authentication auth,
            @PathVariable String habitId) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        HabitDTO habit = habitService.completeHabit(userId, habitId);
        return ResponseEntity.ok(ApiResponse.success(habit, "Habit completed"));
    }

    @GetMapping("/{habitId}/logs")
    @Operation(summary = "Get habit completion logs for a date range (for heatmap)")
    public ResponseEntity<ApiResponse<List<HabitLogDTO>>> getHabitLogs(
            Authentication auth,
            @PathVariable String habitId,
            @RequestParam String startDate,
            @RequestParam String endDate) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        List<HabitLogDTO> logs = habitService.getHabitLogs(userId, habitId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
