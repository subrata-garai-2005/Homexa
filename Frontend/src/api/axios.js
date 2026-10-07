import axios from 'axios';

let storeInstance = null;

export const injectStore = (store) => {
  storeInstance = store;
};

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    if (typeof window !== 'undefined' && envUrl.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api';
    }
    return envUrl;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('homely_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('homely_token');
        localStorage.removeItem('homely_user');
        if (storeInstance) {
          storeInstance.dispatch({ type: 'auth/logout' });
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
