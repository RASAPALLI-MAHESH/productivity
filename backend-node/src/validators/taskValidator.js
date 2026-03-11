'use strict';

const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().max(2000, 'Description must be under 2000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  deadline: z.string().datetime({ offset: true }).optional().nullable(),
  subtasks: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    completed: z.boolean().optional(),
  })).optional(),
  externalLinks: z.array(z.record(z.string())).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

module.exports = { createTaskSchema, updateTaskSchema };
