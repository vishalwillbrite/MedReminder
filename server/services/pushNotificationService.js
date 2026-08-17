const PushSubscription = require('../models/PushSubscription');
const Notification = require('../models/Notification');
const { webpush } = require('../config/webPush');
const logger = require('../utils/logger');

// Remove subscription if 404 or 410 (expired/unsubscribed)
const removeInvalidSubscription = async (endpoint) => {
  try {
    await PushSubscription.deleteOne({ endpoint });
    logger.info(`[Push Service] Removed invalid/expired subscription: ${endpoint}`);
  } catch (error) {
    logger.error(`[Push Service] Error removing subscription ${endpoint}:`, error.message);
  }
};

// Send Web Push payload to a single subscription
const sendPushNotification = async (subscription, payload) => {
  const pushConfig = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };

  const notificationPayload = JSON.stringify(payload);

  try {
    await webpush.sendNotification(pushConfig, notificationPayload);
    return true;
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await removeInvalidSubscription(subscription.endpoint);
    } else {
      logger.error(`[Push Service] Delivery error for ${subscription.endpoint}:`, err.message);
    }
    return false;
  }
};

// Send notification payload to all active subscriptions of a user
const sendNotificationToUser = async (userId, payload, notificationMeta = {}) => {
  try {
    // 1. Create DB Notification Record
    const notificationDoc = await Notification.create({
      user: userId,
      medicine: notificationMeta.medicineId || null,
      title: payload.title || 'MedReminder 💊',
      message: payload.body || '',
      type: notificationMeta.type || 'MEDICINE_REMINDER',
      scheduledFor: notificationMeta.scheduledFor || new Date(),
      sentAt: new Date(),
      status: 'SENT',
      read: false,
      action: 'NONE',
    });

    // Attach notification ID to payload data for client tracking
    if (!payload.data) payload.data = {};
    payload.data.notificationId = notificationDoc._id.toString();

    // 2. Fetch User's Push Subscriptions
    const subscriptions = await PushSubscription.find({ user: userId });
    if (!subscriptions || subscriptions.length === 0) {
      return notificationDoc;
    }

    // 3. Send Web Push to all registered devices
    const pushResults = await Promise.all(
      subscriptions.map((sub) => sendPushNotification(sub, payload))
    );

    const anySuccess = pushResults.some((res) => res === true);
    if (!anySuccess && subscriptions.length > 0) {
      notificationDoc.status = 'FAILED';
      await notificationDoc.save();
    }

    return notificationDoc;
  } catch (error) {
    logger.error(`[Push Service] Error sending notification to user ${userId}:`, error.message);
    return null;
  }
};

// High level helper: Send Scheduled Medicine Reminder
const sendMedicineReminder = async (medicine, reminder) => {
  const payload = {
    title: 'MedReminder 💊',
    body: `Time to take ${medicine.name} — ${medicine.dosage} (${medicine.foodTiming})`,
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: `medicine-reminder-${reminder._id}`,
    data: {
      type: 'MEDICINE_REMINDER',
      medicineId: medicine._id.toString(),
      reminderId: reminder._id.toString(),
      url: `/medicines/${medicine._id}`,
    },
    actions: [
      { action: 'taken', title: '✓ Taken' },
      { action: 'snooze', title: '⏱ Snooze 10 min' },
    ],
  };

  return await sendNotificationToUser(medicine.user, payload, {
    medicineId: medicine._id,
    type: 'MEDICINE_REMINDER',
    scheduledFor: reminder.scheduledTime,
  });
};

// High level helper: Send Missed Dose Notification
const sendMissedDoseNotification = async (medicine, reminder) => {
  const payload = {
    title: 'Missed Medication Reminder ⚠️',
    body: `Your ${reminder.timeSlot} ${medicine.name} (${medicine.dosage}) dose was missed.`,
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: `missed-dose-${reminder._id}`,
    data: {
      type: 'MISSED_DOSE',
      medicineId: medicine._id.toString(),
      reminderId: reminder._id.toString(),
      url: `/dashboard`,
    },
    actions: [
      { action: 'taken', title: 'Take Late' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  return await sendNotificationToUser(medicine.user, payload, {
    medicineId: medicine._id,
    type: 'MISSED_DOSE',
    scheduledFor: reminder.scheduledTime,
  });
};

// High level helper: Send Daily Summary
const sendDailySummary = async (user, summaryData) => {
  const payload = {
    title: `Good morning 👋 ${user.name}`,
    body: `Today you have ${summaryData.total} scheduled doses (${summaryData.completed} completed).`,
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: `daily-summary-${new Date().toISOString().split('T')[0]}`,
    data: {
      type: 'DAILY_SUMMARY',
      url: '/dashboard',
    },
  };

  return await sendNotificationToUser(user._id, payload, {
    type: 'DAILY_SUMMARY',
  });
};

module.exports = {
  removeInvalidSubscription,
  sendPushNotification,
  sendNotificationToUser,
  sendMedicineReminder,
  sendMissedDoseNotification,
  sendDailySummary,
};
