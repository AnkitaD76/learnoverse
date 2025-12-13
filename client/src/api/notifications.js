import apiClient from './client';

export const fetchNotifications = async () => (await apiClient.get('/notifications')).data;
export const markNotificationRead = async id => (await apiClient.patch(`/notifications/${id}/read`)).data;
