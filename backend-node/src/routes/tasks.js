'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../validators/taskValidator');

const router = Router();

router.use(authenticate);

// Static routes BEFORE parameterized routes
router.get('/overdue', ctrl.getOverdueTasks);
router.get('/today',   ctrl.getTodayTasks);

router.post('/',           validate(createTaskSchema), ctrl.createTask);
router.get('/',            ctrl.getTasks);
router.get('/:taskId',     ctrl.getTask);
router.put('/:taskId',     validate(updateTaskSchema), ctrl.updateTask);
router.delete('/:taskId',  ctrl.deleteTask);

module.exports = router;
