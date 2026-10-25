import axios from 'axios';

const TOKEN_STORAGE_KEY = 'authToken';

const baseURL = import.meta.env.VITE_SERVER_BASE_API ?? '/api';

// Debug logs removed for production
// Uncomment below for debugging:
// console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export default api;

