const express = require('express');
const router = express.Router();
const { getTodayReminders, updateReminderStatus } = require('../controllers/reminderController');
const { snoozeReminder } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/today', protect, getTodayReminders);
router.patch('/:id/status', protect, updateReminderStatus);
router.post('/:id/snooze', protect, snoozeReminder);

module.exports = router;
