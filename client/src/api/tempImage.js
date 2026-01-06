import apiClient from './client';

/**
 * Upload temporary image for chat
 * @param {File} imageFile - The image file
 * @returns {Promise} - { success, imageId, imageUrl }
 */
export const uploadTempImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    console.log('📤 Sending FormData to /temp-images/upload:', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
    });

    const { data } = await apiClient.post('/temp-images/upload', formData, {
      headers: {
        'Content-Type': undefined, // Let browser set it with boundary
      },
    });
    console.log('✅ Image upload successful:', data);
    return data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
    console.error('❌ Image upload failed:', {
      status: error.response?.status,
      message: errorMsg,
      fullError: error.response?.data,
    });
    throw error;
  }
};

/**
 * Get temporary image URL
 * @param {string} imageId - The image ID
 * @returns {string} - The image URL
 */
export const getTempImageUrl = (imageId) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  return `${baseURL}/temp-images/${imageId}`;
};

/**
 * Get temporary image info
 * @param {string} imageId - The image ID
 */
export const getTempImageInfo = async (imageId) => {
  const { data } = await apiClient.get(`/temp-images/${imageId}/info`);
  return data;
};

/**
 * Delete temporary image
 * @param {string} imageId - The image ID
 */
export const deleteTempImage = async (imageId) => {
  const { data } = await apiClient.delete(`/temp-images/${imageId}`);
  return data;
};
