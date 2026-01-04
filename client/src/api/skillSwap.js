import apiClient from './client';

export const requestSkillSwap = async payload =>
  (await apiClient.post('/skill-swap/request', payload)).data;

export const respondSkillSwap = async (swapId, action) =>
  (await apiClient.patch(`/skill-swap/${swapId}/respond`, { action })).data;
