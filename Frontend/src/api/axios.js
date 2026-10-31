import axios from 'axios';

let storeInstance = null;

export const injectStore = (store) => {
  storeInstance = store;
};

// Always use same-origin /api so Cloudflare Functions proxy securely to AWS EC2 (No Mixed-Content, No 405)
const getBaseURL = () => '/api';

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
