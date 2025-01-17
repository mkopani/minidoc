import { useSelector } from 'react-redux';

import api from '@/api';
import { type RootState } from '@/store';

const useAuthenticatedApi = () => {
  const token = useSelector((state: RootState) => state.user.token);

  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

export default useAuthenticatedApi;
