'use strict';

const { Router } = require('express');

const router = Router();

router.use('/auth',   require('./auth'));
router.use('/tasks',  require('./tasks'));
router.use('/habits', require('./habits'));
router.use('/users',  require('./users'));

module.exports = router;
