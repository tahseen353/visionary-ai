import axios from 'axios';

const api = axios.create({
  baseURL: '', // Uses the active protocol/host automatically
});

// Interceptor to inject bearer token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
