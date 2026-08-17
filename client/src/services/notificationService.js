import API from './api';

export const getVapidPublicKeyApi = async () => {
  const response = await API.get('/notifications/vapid-public-key');
  return response.data.publicKey;
};

export const subscribePushApi = async (subscriptionData) => {
  const response = await API.post('/notifications/subscribe', subscriptionData);
  return response.data;
};

export const unsubscribePushApi = async (subscriptionData) => {
  const response = await API.delete('/notifications/unsubscribe', { data: subscriptionData });
  return response.data;
};

export const getNotificationsApi = async (params = {}) => {
  const response = await API.get('/notifications', { params });
  return response.data;
};

export const markNotificationReadApi = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsReadApi = async () => {
  const response = await API.patch('/notifications/read-all');
  return response.data;
};

export const deleteNotificationApi = async (id) => {
  const response = await API.delete(`/notifications/${id}`);
  return response.data;
};

export const snoozeReminderApi = async (reminderId, minutes = 10) => {
  const response = await API.post(`/reminders/${reminderId}/snooze`, { minutes });
  return response.data;
};
