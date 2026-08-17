const express = require('express');
const router = express.Router();
const {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', protect, subscribePush);
router.delete('/unsubscribe', protect, unsubscribePush);
router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
