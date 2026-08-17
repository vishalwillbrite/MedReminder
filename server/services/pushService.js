const PushSubscription = require('../models/PushSubscription');
const { webpush } = require('../config/webPush');
const logger = require('../utils/logger');

const sendPushToUser = async (userId, payload) => {
  try {
    const subscriptions = await PushSubscription.find({ user: userId });
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const notificationPayload = JSON.stringify(payload);

    const pushPromises = subscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      };

      try {
        await webpush.sendNotification(pushConfig, notificationPayload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or unsubscribed, remove from DB
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          logger.error('Web Push delivery error:', err.message);
        }
      }
    });

    await Promise.all(pushPromises);
  } catch (error) {
    logger.error('Error in sendPushToUser:', error.message);
  }
};

module.exports = { sendPushToUser };
