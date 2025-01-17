import axios from 'axios';
import Cookies from 'js-cookie';

import { clearUser } from './slices/user';
import { store } from './store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': Cookies.get('csrftoken'),
  },
});

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.user.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default api;

export const refreshCSRFToken = async () => {
  try {
    const response = await api.get('/auth/csrf-token/');
    const { csrfToken } = response.data;
    document.cookie = `csrftoken=${csrfToken}; path=/`;
  } catch (error) {
    console.error('Failed to refresh CSRF token', error);
  }
};
