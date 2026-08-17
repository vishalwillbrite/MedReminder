import { useState, useEffect, useCallback } from 'react';
import {
  getVapidPublicKeyApi,
  subscribePushApi,
  unsubscribePushApi,
} from '../services/notificationService';
import { toast } from 'react-hot-toast';

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

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermissionStatus(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscriptionStatus(!!subscription);
    } catch (err) {
      console.error('Error checking existing push subscription:', err);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error("Push notifications aren't supported by this browser.");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        return true;
      } else {
        toast.error('Notification permission denied. Please allow notifications in browser settings.');
        return false;
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  }, [isSupported]);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported) return false;
    setLoading(true);

    try {
      const hasPermission = permissionStatus === 'granted' || (await requestPermission());
      if (!hasPermission) {
        setLoading(false);
        return false;
      }

      let registration;
      if (navigator.serviceWorker.controller) {
        registration = await navigator.serviceWorker.ready;
      } else {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      const publicKey = await getVapidPublicKeyApi();
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      await subscribePushApi(subscription.toJSON ? subscription.toJSON() : subscription);
      setSubscriptionStatus(true);
      toast.success('Notifications enabled successfully.');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to Web Push:', error);
      toast.error('Failed to enable push notifications. Please check console.');
      setLoading(false);
      return false;
    }
  }, [isSupported, permissionStatus, requestPermission]);

  const unsubscribeFromPush = useCallback(async () => {
    if (!isSupported) return false;
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribePushApi({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }

      setSubscriptionStatus(false);
      toast.success('Unsubscribed from push notifications.');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from Web Push:', error);
      toast.error('Failed to unsubscribe.');
      setLoading(false);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    permissionStatus,
    subscriptionStatus,
    loading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
