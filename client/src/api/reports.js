import apiClient from './client';

/**
 * Report API endpoints
 */

/**
 * Create a new report
 * @param {Object} reportData - Report data
 * @param {string} reportData.reportType - Type of report ('course', 'post', 'user', 'liveSession')
 * @param {string} reportData.reportedEntity - ID of the entity being reported
 * @param {string} reportData.reportedUser - ID of the user being reported (for user reports)
 * @param {string} reportData.category - Report category
 * @param {string} reportData.description - Description of the issue
 */
export const createReport = async reportData => {
  const response = await apiClient.post('/reports', reportData);
  return response.data;
};

/**
 * Get current user's reports
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const getMyReports = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/reports/my-reports', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Get all reports (Admin only)
 * @param {Object} filters - Filter options
 */
export const getAllReports = async (filters = {}) => {
  const response = await apiClient.get('/reports/admin/all', {
    params: filters,
  });
  return response.data;
};

/**
 * Get single report details (Admin only)
 * @param {string} reportId - Report ID
 */
export const getReportById = async reportId => {
  const response = await apiClient.get(`/reports/admin/${reportId}`);
  return response.data;
};

/**
 * Dismiss a report (Admin only)
 * @param {string} reportId - Report ID
 * @param {string} adminNotes - Optional admin notes
 */
export const dismissReport = async (reportId, adminNotes = '') => {
  const response = await apiClient.patch(`/reports/admin/${reportId}/dismiss`, {
    adminNotes,
  });
  return response.data;
};

/**
 * Take action on a report (Admin only)
 * @param {string} reportId - Report ID
 * @param {string} action - Action to take ('delete-content', 'ban-user', 'delete-and-ban')
 * @param {string} adminNotes - Optional admin notes
 */
export const takeActionOnReport = async (reportId, action, adminNotes = '') => {
  const response = await apiClient.patch(`/reports/admin/${reportId}/action`, {
    action,
    adminNotes,
  });
  return response.data;
};

/**
 * Mark a reporter as spam (Admin only)
 * @param {string} reporterId - Reporter user ID
 */
export const markReporterAsSpam = async reporterId => {
  const response = await apiClient.patch(
    `/reports/admin/mark-spam/${reporterId}`
  );
  return response.data;
};

/**
 * Get report statistics (Admin only)
 */
export const getReportStats = async () => {
  const response = await apiClient.get('/reports/admin/stats');
  return response.data;
};
