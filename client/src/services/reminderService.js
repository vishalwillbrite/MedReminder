import API from './api';

export const getTodayRemindersApi = async () => {
  const response = await API.get('/reminders/today');
  return response.data;
};

export const updateReminderStatusApi = async (id, status) => {
  const response = await API.patch(`/reminders/${id}/status`, { status });
  return response.data;
};
