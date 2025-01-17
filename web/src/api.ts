import axios from 'axios';
import Cookies from 'js-cookie';

import { clearUser } from './slices/user';
import { store } from './store';

// Define reusable axios instance with base URL, CSRF token and auth headers
const api = axios.create({
  // TODO: Uncomment after setting up demo-friendly environment variables
  // baseURL: import.meta.env.VITE_API_BASE_URL,
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': Cookies.get('csrftoken'),
  },
});

// Add auth header to axios instance
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.user.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Redirect to login page if user is not authenticated
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add CSRF token to axios instance
api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default api;

/**
 * Refresh CSRF token by making a GET request to /auth/csrf-token/ endpoint
 */
export const refreshCSRFToken = async () => {
  try {
    const response = await api.get('/auth/csrf-token/');
    const { csrfToken } = response.data;
    // Set new CSRF token in cookie
    document.cookie = `csrftoken=${csrfToken}; path=/`;
  } catch (error) {
    console.error('Failed to refresh CSRF token', error);
  }
};
