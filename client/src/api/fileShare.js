import apiClient from './client';

/**
 * Upload a file to a course
 * @param {File} file - The file to upload
 * @param {string} courseId - The course ID
 * @param {string} visibility - 'private', 'course', or 'public'
 * @param {string} description - File description
 */
export const uploadFile = async (file, courseId, visibility = 'course', description = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('courseId', courseId);
  formData.append('visibility', visibility);
  if (description) formData.append('description', description);

  const { data } = await apiClient.post('/file-share/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};

/**
 * Get all files in a course
 * @param {string} courseId - The course ID
 */
export const getFiles = async (courseId) => {
  const { data } = await apiClient.get('/file-share', {
    params: { courseId },
  });

  return data;
};

/**
 * Get file details (metadata)
 * @param {string} fileId - The file ID
 */
export const getFileDetails = async (fileId) => {
  const { data } = await apiClient.get(`/file-share/${fileId}`);

  return data;
};

/**
 * Download a file
 * @param {string} fileId - The file ID
 * @param {string} fileName - The file name for download
 */
export const downloadFile = async (fileId, fileName) => {
  const { data } = await apiClient.get(`/file-share/${fileId}/download`, {
    responseType: 'blob',
  });

  // Create a blob URL and trigger download
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Share a file with specific users
 * @param {string} fileId - The file ID
 * @param {Array} userIds - Array of user IDs to share with
 */
export const shareFile = async (fileId, userIds) => {
  const { data } = await apiClient.patch(`/file-share/${fileId}/share`, {
    userIds,
  });

  return data;
};

/**
 * Delete a file
 * @param {string} fileId - The file ID
 */
export const deleteFile = async (fileId) => {
  const { data } = await apiClient.delete(`/file-share/${fileId}`);

  return data;
};
