import apiClient from './client';

/**
 * Evaluation API Functions
 * Handles assignments and quizzes
 */

/**
 * Instructor Functions
 */

// Create a new evaluation
export const createEvaluation = async (courseId, evaluationData) => {
  const response = await apiClient.post(
    `/courses/${courseId}/evaluations`,
    evaluationData
  );
  return response.data;
};

// Update a draft evaluation
export const updateEvaluation = async (evaluationId, evaluationData) => {
  const response = await apiClient.put(
    `/evaluations/${evaluationId}`,
    evaluationData
  );
  return response.data;
};

// Publish an evaluation
export const publishEvaluation = async evaluationId => {
  const response = await apiClient.post(`/evaluations/${evaluationId}/publish`);
  return response.data;
};

// Close an evaluation
export const closeEvaluation = async evaluationId => {
  const response = await apiClient.post(`/evaluations/${evaluationId}/close`);
  return response.data;
};

// Get all evaluations for a course (instructor view with counts)
export const getInstructorEvaluations = async courseId => {
  const response = await apiClient.get(
    `/courses/${courseId}/evaluations/instructor`
  );
  return response.data;
};

// Get all submissions for an evaluation
export const getEvaluationSubmissions = async evaluationId => {
  const response = await apiClient.get(
    `/evaluations/${evaluationId}/submissions`
  );
  return response.data;
};

// Grade a submission
export const gradeSubmission = async (submissionId, gradeData) => {
  const response = await apiClient.post(
    `/submissions/${submissionId}/grade`,
    gradeData
  );
  return response.data;
};

/**
 * Student Functions
 */

// Get all evaluations for a course (student view)
export const getStudentEvaluations = async courseId => {
  const response = await apiClient.get(`/courses/${courseId}/evaluations`);
  return response.data;
};

// Get evaluation details with questions
export const getEvaluationById = async evaluationId => {
  const response = await apiClient.get(`/evaluations/${evaluationId}`);
  return response.data;
};

// Submit evaluation answers
export const submitEvaluation = async (evaluationId, answers) => {
  const response = await apiClient.post(`/evaluations/${evaluationId}/You have already submitted this evaluation`, {
    answers,
  });
  return response.data;
};

// Get student's own submission for an evaluation
export const getMySubmission = async evaluationId => {
  const response = await apiClient.get(
    `/evaluations/${evaluationId}/my-submission`
  );
  return response.data;
};
