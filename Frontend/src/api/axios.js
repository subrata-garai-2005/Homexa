import axios from 'axios';

let storeInstance = null;

export const injectStore = (store) => {
  storeInstance = store;
};

// Production: use AWS EC2 backend directly (HTTP — will be fixed with nginx/SSL later)
// Development: use local Vite proxy /api
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
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
