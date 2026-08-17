const PushSubscription = require('../models/PushSubscription');
const Notification = require('../models/Notification');
const Reminder = require('../models/Reminder');
const { publicVapidKey } = require('../config/webPush');

// @desc    Get Public VAPID Key for Frontend Subscription
// @route   GET /api/notifications/vapid-public-key
// @access  Public
const getVapidPublicKey = (req, res) => {
  if (!publicVapidKey) {
    return res.status(500).json({ message: 'VAPID public key not configured on server' });
  }
  res.json({ publicKey: publicVapidKey });
};

// @desc    Save/Update Push Subscription for Authenticated User
// @route   POST /api/notifications/subscribe
// @access  Private
const subscribePush = async (req, res) => {
  try {
    const { endpoint, keys, userAgent, deviceInfo } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: 'Invalid subscription payload. Endpoint and keys are required.' });
    }

    const subscription = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        user: req.user._id,
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        userAgent: userAgent || req.headers['user-agent'] || '',
        deviceInfo: deviceInfo || '',
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Push subscription registered successfully', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unsubscribe Push Endpoint
// @route   DELETE /api/notifications/unsubscribe
// @access  Private
const unsubscribePush = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint is required to unsubscribe' });
    }

    await PushSubscription.deleteOne({ endpoint, user: req.user._id });

    res.json({ message: 'Unsubscribed from push notifications' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's notification history (with pagination, read & type filtering, sorting)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

    if (req.query.read !== undefined) {
      query.read = req.query.read === 'true';
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('medicine')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({
      notifications,
      unreadCount,
      page,
      pages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.status = 'READ';
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification history item
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true, status: 'READ' } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Snooze reminder by X minutes (10, 30, 60 min)
// @route   POST /api/reminders/:id/snooze
// @access  Private
const snoozeReminder = async (req, res) => {
  try {
    const minutes = parseInt(req.body.minutes) || 10;
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id }).populate('medicine');

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const newScheduledTime = new Date(Date.now() + minutes * 60 * 1000);
    const newHours = String(newScheduledTime.getHours()).padStart(2, '0');
    const newMinutes = String(newScheduledTime.getMinutes()).padStart(2, '0');
    const newTimeSlot = `${newHours}:${newMinutes}`;

    reminder.scheduledTime = newScheduledTime;
    reminder.timeSlot = newTimeSlot;
    reminder.status = 'Pending';
    await reminder.save();

    // Create Notification Log for Snooze
    await Notification.create({
      user: req.user._id,
      medicine: reminder.medicine ? reminder.medicine._id : null,
      title: `⏱ Dose Snoozed: ${reminder.medicine ? reminder.medicine.name : 'Medicine'}`,
      message: `Reminding again in ${minutes} minutes at ${newTimeSlot}.`,
      type: 'SNOOZED',
      scheduledFor: newScheduledTime,
      sentAt: new Date(),
      status: 'SENT',
      action: 'SNOOZED',
    });

    res.json({ message: `Reminder snoozed for ${minutes} minutes`, reminder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  snoozeReminder,
};
