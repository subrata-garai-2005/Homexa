import axios from "axios";

// Serialization means converting a JavaScript object or array into a URL query string that can be sent in an HTTP request.

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

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
});
