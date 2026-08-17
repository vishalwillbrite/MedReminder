import API from './api';

export const getDashboardDataApi = async () => {
  const response = await API.get('/dashboard');
  return response.data;
};

export const getDashboardAnalyticsApi = async () => {
  const response = await API.get('/dashboard/analytics');
  return response.data;
};
