import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Request interceptor to add Authorization token if saved in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('medreminder_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear local storage session if not on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('medreminder_token');
        localStorage.removeItem('medreminder_user');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
