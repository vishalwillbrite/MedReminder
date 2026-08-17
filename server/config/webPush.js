const webpush = require('web-push');

const vapidEmail = process.env.VAPID_EMAIL;
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

let isConfigured = false;

if (!vapidEmail || !publicVapidKey || !privateVapidKey) {
  const missing = [];
  if (!vapidEmail) missing.push('VAPID_EMAIL');
  if (!publicVapidKey) missing.push('VAPID_PUBLIC_KEY');
  if (!privateVapidKey) missing.push('VAPID_PRIVATE_KEY');

  console.warn(
    `[Web Push Warning]: Missing required VAPID environment variable(s): ${missing.join(
      ', '
    )}. Web push notifications will be disabled until valid VAPID keys are provided in server/.env.`
  );
} else {
  try {
    webpush.setVapidDetails(vapidEmail, publicVapidKey, privateVapidKey);
    isConfigured = true;
    console.log('[Web Push Configured Successfully with VAPID keys]');
  } catch (error) {
    console.warn('[Web Push Initialization Warning]: Invalid VAPID credentials provided:', error.message);
    console.warn('Run "npx web-push generate-vapid-keys" to generate new valid VAPID keys.');
  }
}

module.exports = { webpush, publicVapidKey: isConfigured ? publicVapidKey : '', isConfigured };
