'use strict';

const { z } = require('zod');

const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(100, 'Name must be under 100 characters'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  category: z.string().optional(),
  frequency: z.string().optional(),
  goalType: z.string().optional(),
  goalValue: z.number().int().min(0).optional(),
  motivation: z.string().optional(),
});

const updateHabitSchema = createHabitSchema.partial();

module.exports = { createHabitSchema, updateHabitSchema };
