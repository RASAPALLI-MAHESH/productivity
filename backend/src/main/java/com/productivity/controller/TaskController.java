package com.productivity.controller;

import com.productivity.dto.ApiResponse;
import com.productivity.dto.TaskDTO;
import com.productivity.service.TaskService;
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
@RequestMapping("/api/v1/tasks")
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<ApiResponse<TaskDTO>> createTask(
            Authentication auth,
            @Valid @RequestBody TaskDTO taskDTO) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        TaskDTO created = taskService.createTask(userId, taskDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Task created"));
    }

    @GetMapping
    @Operation(summary = "List tasks with filtering, sorting, and pagination")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getTasks(
            Authentication auth,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        List<TaskDTO> tasks = taskService.getTasks(userId, status, priority, sortBy, sortDirection, page, size);
        long total = taskService.getTaskCount(userId);
        int totalPages = (int) Math.ceil((double) total / size);
        return ResponseEntity.ok(ApiResponse.paginated(tasks, totalPages, total));
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "Get a task by ID")
    public ResponseEntity<ApiResponse<TaskDTO>> getTask(
            Authentication auth,
            @PathVariable String taskId) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        TaskDTO task = taskService.getTask(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @PutMapping("/{taskId}")
    @Operation(summary = "Update a task")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTask(
            Authentication auth,
            @PathVariable String taskId,
            @Valid @RequestBody TaskDTO taskDTO) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        TaskDTO updated = taskService.updateTask(userId, taskId, taskDTO);
        return ResponseEntity.ok(ApiResponse.success(updated, "Task updated"));
    }

    @DeleteMapping("/{taskId}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            Authentication auth,
            @PathVariable String taskId) throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        taskService.deleteTask(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted"));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get overdue tasks")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getOverdueTasks(Authentication auth)
            throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        List<TaskDTO> tasks = taskService.getOverdueTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's tasks")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getTodayTasks(Authentication auth)
            throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        List<TaskDTO> tasks = taskService.getTodayTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }
}
