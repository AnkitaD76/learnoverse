import apiClient from './client';

export const fetchCourses = async params => {
  const res = await apiClient.get('/courses', { params });
  return res.data;
};

export const fetchCourseById = async courseId => {
  const res = await apiClient.get(`/courses/${courseId}`);
  return res.data;
};

export const createCourse = async payload => {
  const res = await apiClient.post('/courses', payload);
  return res.data;
};

export const enrollInCourse = async courseId => {
  const res = await apiClient.post(`/courses/${courseId}/enroll`);
  return res.data;
};

export const withdrawFromCourse = async courseId => {
  const res = await apiClient.post(`/courses/${courseId}/withdraw`);
  return res.data;
};
