import apiClient from "./client";

export const requestSkillSwap = async (payload) =>
  (await apiClient.post("/skill-swap/request", payload)).data;


export const respondSkillSwap = async (id, action, chosenCourseId) =>
  (await apiClient.patch(`/skill-swap/${id}/respond`, { action, chosenCourseId })).data;


