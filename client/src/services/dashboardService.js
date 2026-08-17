import API from './api';

export const getDashboardDataApi = async () => {
  const response = await API.get('/dashboard');
  return response.data;
};
