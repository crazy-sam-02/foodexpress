import axios from 'axios';
import { config } from './config';

const api = axios.create({
  // Use configured API_URL when available to avoid proxy issues
  baseURL: (config?.API_URL) || '/api',
  withCredentials: true,
});

// Attach token from localStorage to every request if present
api.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem('token');
    if (token && cfg.headers) {
      cfg.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }
  return cfg;
});

// If a response returns 401, let callers decide; we bubble up the error
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // Optionally we could centralize logout here, but keep it explicit in contexts
    return Promise.reject(error);
  }
);

export default api;
