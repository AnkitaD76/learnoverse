import apiClient from './client';

/**
 * Get user's certificate for a specific course
 */
export const getMyCertificate = async courseId => {
  const res = await apiClient.get(`/courses/${courseId}/certificate`);
  return res.data;
};

/**
 * Get public certificate details
 */
export const getCertificate = async certificateId => {
  const res = await apiClient.get(`/certificates/${certificateId}`);
  return res.data;
};

/**
 * Get all certificates for the current user
 */
export const getMyCertificates = async () => {
  const res = await apiClient.get('/certificates/my-certificates');
  return res.data;
};
