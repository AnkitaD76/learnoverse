import apiClient from './client';

export const fetchDashboard = async () => {
  const res = await apiClient.get('/dashboard');
  return res.data;
};
