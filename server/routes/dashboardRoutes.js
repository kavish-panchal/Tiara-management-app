const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

// Dashboard stats route
router.get('/stats', getDashboardStats);

module.exports = router;

