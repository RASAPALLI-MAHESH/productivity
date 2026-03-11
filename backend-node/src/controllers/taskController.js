'use strict';

const taskService = require('../services/taskService');
const { success, paginated, error } = require('../utils/apiResponse');

// POST /api/v1/tasks
async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(req.uid, req.body);
    return success(res, task, 'Task created', 201);
  } catch (err) { next(err); }
}

// GET /api/v1/tasks
async function getTasks(req, res, next) {
  try {
    const { status, priority, sortBy = 'createdAt', sortDirection = 'desc', page = 0, size = 20 } = req.query;
    const tasks = await taskService.getTasks(req.uid, {
      status, priority, sortBy, sortDirection,
      page: parseInt(page, 10),
      size: parseInt(size, 10),
    });
    const total = await taskService.getTaskCount(req.uid);
    const totalPages = Math.ceil(total / parseInt(size, 10));
    return paginated(res, tasks, totalPages, total);
  } catch (err) { next(err); }
}

// GET /api/v1/tasks/overdue
async function getOverdueTasks(req, res, next) {
  try {
    const tasks = await taskService.getOverdueTasks(req.uid);
    return success(res, tasks);
  } catch (err) { next(err); }
}

// GET /api/v1/tasks/today
async function getTodayTasks(req, res, next) {
  try {
    const tasks = await taskService.getTodayTasks(req.uid);
    return success(res, tasks);
  } catch (err) { next(err); }
}

// GET /api/v1/tasks/:taskId
async function getTask(req, res, next) {
  try {
    const task = await taskService.getTask(req.uid, req.params.taskId);
    return success(res, task);
  } catch (err) { next(err); }
}

// PUT /api/v1/tasks/:taskId
async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask(req.uid, req.params.taskId, req.body);
    return success(res, task, 'Task updated');
  } catch (err) { next(err); }
}

// DELETE /api/v1/tasks/:taskId
async function deleteTask(req, res, next) {
  try {
    await taskService.deleteTask(req.uid, req.params.taskId);
    return success(res, null, 'Task deleted');
  } catch (err) { next(err); }
}

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getOverdueTasks, getTodayTasks };
