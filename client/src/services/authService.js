import API from './api';

export const registerApi = async (userData) => {
  const response = await API.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('medreminder_token', response.data.token);
    localStorage.setItem('medreminder_user', JSON.stringify(response.data));
  }
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('medreminder_token', response.data.token);
    localStorage.setItem('medreminder_user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logoutApi = async () => {
  try {
    await API.post('/auth/logout');
  } finally {
    localStorage.removeItem('medreminder_token');
    localStorage.removeItem('medreminder_user');
  }
};

export const getMeApi = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updateProfileApi = async (formData) => {
  const response = await API.put('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const changePasswordApi = async (passwordData) => {
  const response = await API.put('/auth/change-password', passwordData);
  return response.data;
};
