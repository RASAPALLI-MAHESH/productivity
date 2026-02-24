package com.productivity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public class TaskDTO {
    private String id;
    private List<SubtaskDTO> subtasks;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be under 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must be under 2000 characters")
    private String description;

    @Pattern(regexp = "^(low|medium|high|critical)$", message = "Priority must be low, medium, high, or critical")
    private String priority;

    @Pattern(regexp = "^(todo|in-progress|done)$", message = "Status must be todo, in-progress, or done")
    private String status;

    private String deadline; // ISO 8601 string
    private String createdAt;
    private String updatedAt;

    public TaskDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public List<SubtaskDTO> getSubtasks() { return subtasks; }
    public void setSubtasks(List<SubtaskDTO> subtasks) { this.subtasks = subtasks; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
