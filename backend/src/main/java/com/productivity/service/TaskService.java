package com.productivity.service;

import com.google.cloud.Timestamp;
import com.productivity.dto.SubtaskDTO;
import com.productivity.dto.TaskDTO;
import com.productivity.exception.ResourceNotFoundException;
import com.productivity.model.Task;
import com.productivity.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskService.class);
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public TaskDTO createTask(String userId, TaskDTO dto) throws ExecutionException, InterruptedException {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority() != null ? dto.getPriority() : "medium");
        task.setStatus(dto.getStatus() != null ? dto.getStatus() : "todo");
        task.setCreatedAt(Timestamp.now());
        task.setUpdatedAt(Timestamp.now());

        if (dto.getDeadline() != null) {
            task.setDeadline(Timestamp.ofTimeSecondsAndNanos(
                    Instant.parse(dto.getDeadline()).getEpochSecond(), 0));
        }

        if (dto.getSubtasks() != null) {
            task.setSubtasks(dto.getSubtasks().stream().map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("title", s.getTitle());
                map.put("completed", s.isCompleted());
                return map;
            }).collect(Collectors.toList()));
        }

        Task saved = taskRepository.save(userId, task);
        return toDTO(saved);
    }

    public TaskDTO getTask(String userId, String taskId) throws ExecutionException, InterruptedException {
        Task task = taskRepository.findById(userId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        return toDTO(task);
    }

    public List<TaskDTO> getTasks(String userId, String status, String priority, String sortBy,
                                   String sortDirection, int page, int size) throws ExecutionException, InterruptedException {
        List<Task> tasks = taskRepository.findAll(userId, status, priority, sortBy, sortDirection, page, size);
        return tasks.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public long getTaskCount(String userId) throws ExecutionException, InterruptedException {
        return taskRepository.count(userId);
    }

    public TaskDTO updateTask(String userId, String taskId, TaskDTO dto) throws ExecutionException, InterruptedException {
        Task existing = taskRepository.findById(userId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        if (dto.getTitle() != null) existing.setTitle(dto.getTitle());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getPriority() != null) existing.setPriority(dto.getPriority());
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
        if (dto.getDeadline() != null) {
            existing.setDeadline(Timestamp.ofTimeSecondsAndNanos(
                    Instant.parse(dto.getDeadline()).getEpochSecond(), 0));
        }

        if (dto.getSubtasks() != null) {
            existing.setSubtasks(dto.getSubtasks().stream().map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("title", s.getTitle());
                map.put("completed", s.isCompleted());
                return map;
            }).collect(Collectors.toList()));
        }

        existing.setUpdatedAt(Timestamp.now());

        Task saved = taskRepository.save(userId, existing);
        return toDTO(saved);
    }

    public void deleteTask(String userId, String taskId) throws ExecutionException, InterruptedException {
        taskRepository.findById(userId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        taskRepository.delete(userId, taskId);
    }

    public List<TaskDTO> getOverdueTasks(String userId) throws ExecutionException, InterruptedException {
        return taskRepository.findOverdue(userId, Timestamp.now())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getTodayTasks(String userId) throws ExecutionException, InterruptedException {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Timestamp startOfDay = Timestamp.ofTimeSecondsAndNanos(
                today.atStartOfDay(ZoneOffset.UTC).toEpochSecond(), 0);
        Timestamp endOfDay = Timestamp.ofTimeSecondsAndNanos(
                today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toEpochSecond(), 0);
        return taskRepository.findByDeadlineRange(userId, startOfDay, endOfDay)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private TaskDTO toDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus());
        if (task.getDeadline() != null) {
            dto.setDeadline(task.getDeadline().toDate().toInstant().toString());
        }

        if (task.getSubtasks() != null) {
            dto.setSubtasks(task.getSubtasks().stream().map(s -> {
                SubtaskDTO sub = new SubtaskDTO();
                sub.setId((String) s.get("id"));
                sub.setTitle((String) s.get("title"));
                sub.setCompleted((Boolean) s.get("completed"));
                return sub;
            }).collect(Collectors.toList()));
        }

        if (task.getCreatedAt() != null) {
            dto.setCreatedAt(task.getCreatedAt().toDate().toInstant().toString());
        }
        if (task.getUpdatedAt() != null) {
            dto.setUpdatedAt(task.getUpdatedAt().toDate().toInstant().toString());
        }
        return dto;
    }
}
