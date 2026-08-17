import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  snoozeReminderApi,
} from '../services/notificationService';
import { useNotifications as usePushNotifications } from '../hooks/useNotifications';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const pushHook = usePushNotifications();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchNotifications = async (filters = {}) => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const data = await getNotificationsApi(filters);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsReadApi();
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteNotificationApi(id);
      fetchNotifications();
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const snooze = async (reminderId, minutes = 10) => {
    try {
      await snoozeReminderApi(reminderId, minutes);
      toast.success(`Reminder snoozed for ${minutes} minutes`);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to snooze reminder');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        ...pushHook,
        notifications,
        unreadCount,
        loadingHistory,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        snooze,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const useNotifications = useNotificationContext;
