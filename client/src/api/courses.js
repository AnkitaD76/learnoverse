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

<<<<<<< HEAD
// ✅ NEW: My enrollments (shows progress)
export const fetchMyEnrollments = async () => {
  const res = await apiClient.get('/courses/me/enrollments');
  return res.data;
};

// ✅ NEW: My created courses
export const fetchMyCreatedCourses = async () => {
  const res = await apiClient.get('/courses/me/created');
  return res.data;
};

// ✅ NEW: mark lesson complete (for progress later)
export const markLessonComplete = async (courseId, lessonId) => {
  const res = await apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
=======
export const fetchCourseEnrollments = async courseId => {
  const res = await apiClient.get(`/courses/${courseId}/enrollments`);
>>>>>>> 618ae80c8785cc51aaeb46b50103e6a39a7e6932
  return res.data;
};
