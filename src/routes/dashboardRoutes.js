const express = require('express');

const dashboardController = require('../controllers/dashboardcontroller');
const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/dashboard', autenticar, dashboardController.dashboard);

module.exports = router;
