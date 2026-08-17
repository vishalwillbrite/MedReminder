const express = require('express');
const router = express.Router();
const { getDashboardData, getDashboardAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboardData);
router.get('/analytics', protect, getDashboardAnalytics);

module.exports = router;
