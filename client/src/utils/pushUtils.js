import { getVapidPublicKeyApi, subscribePushApi } from '../services/notificationService';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Service Worker Registered]:', registration.scope);
      return registration;
    } catch (err) {
      console.error('[Service Worker Registration Failed]:', err);
    }
  }
  return null;
};

export const subscribeUserToPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied by user');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const publicKey = await getVapidPublicKeyApi();
    const convertedVapidKey = urlBase64ToUint8Array(publicKey);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    await subscribePushApi(subscription);
    console.log('[Web Push Subscription Active]');
    return true;
  } catch (error) {
    console.error('Failed to subscribe user to Web Push:', error);
    return false;
  }
};
