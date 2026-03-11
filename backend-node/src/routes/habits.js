'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/habitController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createHabitSchema, updateHabitSchema } = require('../validators/habitValidator');

const router = Router();

router.use(authenticate);

// Static routes BEFORE parameterized routes
router.get('/dashboard', ctrl.getDashboard);

router.post('/',                      validate(createHabitSchema), ctrl.createHabit);
router.get('/',                       ctrl.getHabits);
router.get('/:habitId',               ctrl.getHabit);
router.put('/:habitId',               validate(updateHabitSchema), ctrl.updateHabit);
router.delete('/:habitId',            ctrl.deleteHabit);
router.post('/:habitId/complete',     ctrl.completeHabit);
router.get('/:habitId/logs',          ctrl.getHabitLogs);

module.exports = router;
