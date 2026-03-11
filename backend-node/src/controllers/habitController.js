'use strict';

const habitService = require('../services/habitService');
const { success, error } = require('../utils/apiResponse');

// POST /api/v1/habits
async function createHabit(req, res, next) {
  try {
    const habit = await habitService.createHabit(req.uid, req.body);
    return success(res, habit, 'Habit created', 201);
  } catch (err) { next(err); }
}

// GET /api/v1/habits
async function getHabits(req, res, next) {
  try {
    const habits = await habitService.getHabits(req.uid);
    return success(res, habits);
  } catch (err) { next(err); }
}

// GET /api/v1/habits/dashboard
async function getDashboard(req, res, next) {
  try {
    const dashboard = await habitService.getDashboard(req.uid);
    return success(res, dashboard);
  } catch (err) { next(err); }
}

// GET /api/v1/habits/:habitId
async function getHabit(req, res, next) {
  try {
    const habit = await habitService.getHabit(req.uid, req.params.habitId);
    return success(res, habit);
  } catch (err) { next(err); }
}

// PUT /api/v1/habits/:habitId
async function updateHabit(req, res, next) {
  try {
    const habit = await habitService.updateHabit(req.uid, req.params.habitId, req.body);
    return success(res, habit, 'Habit updated');
  } catch (err) { next(err); }
}

// DELETE /api/v1/habits/:habitId
async function deleteHabit(req, res, next) {
  try {
    await habitService.deleteHabit(req.uid, req.params.habitId);
    return success(res, null, 'Habit deleted');
  } catch (err) { next(err); }
}

// POST /api/v1/habits/:habitId/complete
async function completeHabit(req, res, next) {
  try {
    const habit = await habitService.completeHabit(req.uid, req.params.habitId);
    return success(res, habit, 'Habit completed');
  } catch (err) { next(err); }
}

// GET /api/v1/habits/:habitId/logs
async function getHabitLogs(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return error(res, 'startDate and endDate query parameters are required', 400);
    const logs = await habitService.getHabitLogs(req.uid, req.params.habitId, startDate, endDate);
    return success(res, logs);
  } catch (err) { next(err); }
}

module.exports = { createHabit, getHabits, getDashboard, getHabit, updateHabit, deleteHabit, completeHabit, getHabitLogs };
