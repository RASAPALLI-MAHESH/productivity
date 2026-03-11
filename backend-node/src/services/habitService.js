'use strict';

const habitRepo = require('../repositories/habitRepository');
const habitLogRepo = require('../repositories/habitLogRepository');
const { toISO } = require('../utils/timestamp');

function notFound(id) {
  return Object.assign(new Error(`Habit not found: ${id}`), { status: 404 });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function dateStrMinusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(dateA, dateB) {
  const msA = new Date(dateA).getTime();
  const msB = new Date(dateB).getTime();
  return Math.round(Math.abs(msB - msA) / 86400000);
}

async function createHabit(userId, dto) {
  const habit = {
    name: dto.name,
    description: dto.description || null,
    category: dto.category || null,
    frequency: dto.frequency || 'daily',
    goalType: dto.goalType || null,
    goalValue: dto.goalValue || 0,
    motivation: dto.motivation || null,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    createdAt: new Date(),
  };
  const saved = await habitRepo.save(userId, habit);
  return toDTO(saved);
}

async function getHabits(userId) {
  const habits = await habitRepo.findAll(userId);
  return habits.map(toDTO);
}

async function getHabit(userId, habitId) {
  const habit = await habitRepo.findById(userId, habitId);
  if (!habit) throw notFound(habitId);
  return toDTO(habit);
}

async function updateHabit(userId, habitId, dto) {
  const existing = await habitRepo.findById(userId, habitId);
  if (!existing) throw notFound(habitId);

  if (dto.name != null) existing.name = dto.name;
  if (dto.description != null) existing.description = dto.description;
  if (dto.category != null) existing.category = dto.category;
  if (dto.frequency != null) existing.frequency = dto.frequency;
  if (dto.goalType != null) existing.goalType = dto.goalType;
  if (dto.goalValue != null && dto.goalValue > 0) existing.goalValue = dto.goalValue;
  if (dto.motivation != null) existing.motivation = dto.motivation;

  const saved = await habitRepo.save(userId, existing);
  return toDTO(saved);
}

async function deleteHabit(userId, habitId) {
  const habit = await habitRepo.findById(userId, habitId);
  if (!habit) throw notFound(habitId);
  await habitRepo.remove(userId, habitId);
}

async function completeHabit(userId, habitId) {
  const habit = await habitRepo.findById(userId, habitId);
  if (!habit) throw notFound(habitId);

  const today = todayStr();

  // Idempotent — already done today
  if (habit.lastCompletedDate === today) return toDTO(habit);

  // Persist log
  await habitLogRepo.save(userId, habitId, {
    date: today,
    completed: true,
    completedAt: new Date().toISOString(),
  });

  // Streak logic
  if (habit.lastCompletedDate) {
    const diff = daysBetween(habit.lastCompletedDate, today);
    if (diff === 1) {
      habit.currentStreak = (habit.currentStreak || 0) + 1;
    } else {
      habit.currentStreak = 1;
    }
  } else {
    habit.currentStreak = 1;
  }

  if (habit.currentStreak > (habit.longestStreak || 0)) {
    habit.longestStreak = habit.currentStreak;
  }

  habit.lastCompletedDate = today;
  const saved = await habitRepo.save(userId, habit);
  return toDTO(saved);
}

async function getHabitLogs(userId, habitId, startDate, endDate) {
  const habit = await habitRepo.findById(userId, habitId);
  if (!habit) throw notFound(habitId);
  const logs = await habitLogRepo.findByDateRange(userId, habitId, startDate, endDate);
  return logs.map(l => ({ date: l.date, completed: l.completed, completedAt: l.completedAt || null }));
}

async function getDashboard(userId) {
  const habits = await getHabits(userId);
  const endDate = todayStr();
  const startDate = dateStrMinusDays(30);

  const logs = {};
  for (const h of habits) {
    logs[h.id] = await getHabitLogs(userId, h.id, startDate, endDate);
  }

  const intelligence = computeIntelligence(habits, logs);
  return { habits, logs, intelligence };
}

function computeIntelligence(habits, logsMap) {
  if (!habits.length) {
    return { consistencyScore: 0, riskCount: 0, longestStreak: 0, weeklyCompletionRate: 0 };
  }

  const today = new Date();

  // 1. Weighted consistency score (30 days, recency-weighted)
  let weightedCompletion = 0;
  let totalWeight = 0;

  for (let i = 0; i < 30; i++) {
    const dateStr = dateStrMinusDays(i);
    const weight = (30 - i) / 30;
    totalWeight += weight * habits.length;

    for (const h of habits) {
      const hLogs = logsMap[h.id] || [];
      if (hLogs.some(l => l.date === dateStr && l.completed)) {
        weightedCompletion += weight;
      }
    }
  }
  const consistencyScore = totalWeight > 0 ? Math.round((weightedCompletion / totalWeight) * 100) : 0;

  // 2. Risk count — daily habits with streak but not completed today or yesterday
  const todayS = todayStr();
  const yesterdayS = dateStrMinusDays(1);
  let riskCount = 0;
  for (const h of habits) {
    if ((h.frequency === 'daily' || !h.frequency) &&
        h.currentStreak > 0 &&
        h.lastCompletedDate !== todayS &&
        h.lastCompletedDate !== yesterdayS) {
      riskCount++;
    }
  }

  // 3. Longest current streak
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);

  // 4. Weekly completion rate
  let weeklyCompleted = 0;
  const weeklyExpected = habits.length * 7;
  for (let i = 0; i < 7; i++) {
    const dateStr = dateStrMinusDays(i);
    for (const h of habits) {
      const hLogs = logsMap[h.id] || [];
      if (hLogs.some(l => l.date === dateStr && l.completed)) weeklyCompleted++;
    }
  }
  const weeklyCompletionRate = weeklyExpected > 0 ? Math.round((weeklyCompleted / weeklyExpected) * 100) : 0;

  return { consistencyScore, riskCount, longestStreak, weeklyCompletionRate };
}

function toDTO(habit) {
  return {
    id: habit.id,
    name: habit.name,
    description: habit.description || null,
    category: habit.category || null,
    frequency: habit.frequency || 'daily',
    goalType: habit.goalType || null,
    goalValue: habit.goalValue || 0,
    motivation: habit.motivation || null,
    difficulty: habit.difficulty || 1,
    currentStreak: habit.currentStreak || 0,
    longestStreak: habit.longestStreak || 0,
    streakFreezeAvailable: habit.streakFreezeAvailable || 0,
    lastCompletedDate: habit.lastCompletedDate || null,
    createdAt: toISO(habit.createdAt),
  };
}

module.exports = { createHabit, getHabits, getHabit, updateHabit, deleteHabit, completeHabit, getHabitLogs, getDashboard };
