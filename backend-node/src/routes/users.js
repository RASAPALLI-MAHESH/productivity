'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema, onboardingSchema } = require('../validators/userValidator');

const router = Router();

router.use(authenticate);

router.get('/me',          ctrl.getProfile);
router.put('/me',          validate(updateProfileSchema), ctrl.updateProfile);
router.post('/onboarding', validate(onboardingSchema),   ctrl.completeOnboarding);
router.delete('/me',       ctrl.deleteAccount);

module.exports = router;
