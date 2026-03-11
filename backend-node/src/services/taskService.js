'use strict';

const { v4: uuidv4 } = require('uuid');
const taskRepo = require('../repositories/taskRepository');
const { toISO } = require('../utils/timestamp');

function notFound(taskId) {
  return Object.assign(new Error(`Task not found: ${taskId}`), { status: 404 });
}

async function createTask(userId, dto) {
  const task = {
    title: dto.title,
    description: dto.description || null,
    priority: dto.priority || 'medium',
    status: dto.status || 'todo',
    subtasks: dto.subtasks ? dto.subtasks.map(s => ({
      id: s.id || uuidv4(),
      title: s.title,
      completed: s.completed || false,
    })) : [],
    externalLinks: dto.externalLinks || [],
    deadline: dto.deadline ? new Date(dto.deadline) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const saved = await taskRepo.save(userId, task);
  return toDTO(saved);
}

async function getTask(userId, taskId) {
  const task = await taskRepo.findById(userId, taskId);
  if (!task) throw notFound(taskId);
  return toDTO(task);
}

async function getTasks(userId, { status, priority, sortBy, sortDirection, page, size } = {}) {
  const tasks = await taskRepo.findAll(userId, { status, priority, sortBy, sortDirection, page, size });
  return tasks.map(toDTO);
}

async function getTaskCount(userId) {
  return taskRepo.count(userId);
}

async function updateTask(userId, taskId, dto) {
  const existing = await taskRepo.findById(userId, taskId);
  if (!existing) throw notFound(taskId);

  if (dto.title != null) existing.title = dto.title;
  if (dto.description != null) existing.description = dto.description;
  if (dto.priority != null) existing.priority = dto.priority;
  if (dto.status != null) existing.status = dto.status;
  if (dto.deadline != null) existing.deadline = new Date(dto.deadline);
  if (dto.subtasks != null) {
    existing.subtasks = dto.subtasks.map(s => ({
      id: s.id || uuidv4(),
      title: s.title,
      completed: s.completed || false,
    }));
  }
  if (dto.externalLinks != null) existing.externalLinks = dto.externalLinks;
  existing.updatedAt = new Date();

  const saved = await taskRepo.save(userId, existing);
  return toDTO(saved);
}

async function deleteTask(userId, taskId) {
  const task = await taskRepo.findById(userId, taskId);
  if (!task) throw notFound(taskId);
  await taskRepo.remove(userId, taskId);
}

async function getOverdueTasks(userId) {
  const tasks = await taskRepo.findOverdue(userId);
  return tasks.map(toDTO);
}

async function getTodayTasks(userId) {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const tasks = await taskRepo.findByDeadlineRange(userId, startOfDay, endOfDay);
  return tasks.map(toDTO);
}

function toDTO(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description || null,
    priority: task.priority,
    status: task.status,
    deadline: toISO(task.deadline),
    subtasks: task.subtasks || [],
    externalLinks: task.externalLinks || [],
    createdAt: toISO(task.createdAt),
    updatedAt: toISO(task.updatedAt),
  };
}

module.exports = { createTask, getTask, getTasks, getTaskCount, updateTask, deleteTask, getOverdueTasks, getTodayTasks };
