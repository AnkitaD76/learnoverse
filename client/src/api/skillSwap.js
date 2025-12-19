import apiClient from './client';

export const requestSkillSwap = async payload =>
  (await apiClient.post('/skill-swaps/request', payload)).data;

export const respondSkillSwap = async (swapId, action) =>
  (await apiClient.patch(`/skill-swaps/${swapId}/respond`, { action })).data;
