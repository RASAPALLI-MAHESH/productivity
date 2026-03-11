'use strict';

const { z } = require('zod');

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  photoURL: z.string().url().optional().nullable(),
});

const onboardingSchema = z.object({
  bio: z.string().max(500).optional(),
});

module.exports = { updateProfileSchema, onboardingSchema };
