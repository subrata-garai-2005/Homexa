// Always use same-origin /api — Worker handles both static files and API proxy
import axios from 'axios';

let storeInstance = null;

export const injectStore = (store) => {
  storeInstance = store;
};

const api = axios.create({
  baseURL: '/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
