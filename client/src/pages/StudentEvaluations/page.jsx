import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getStudentEvaluations } from '../../api/evaluations';

export const StudentEvaluationsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, [courseId]);

  const fetchEvaluations = async () => {
    try {
      const res = await getStudentEvaluations(courseId);
      setEvaluations(res.evaluations || []);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          'Failed to fetch evaluations'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto mt-8 max-w-4xl">
        <Button
          variant="secondary"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mb-4"
        >
          ← Back to Course
        </Button>

        <h1 className="mb-6 text-2xl font-bold">Assignments & Quizzes</h1>

        {evaluations.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No evaluations available yet
          </Card>
        ) : (
          <div className="space-y-4">
            {evaluations.map(evaluation => (
              <Card key={evaluation._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-semibold">
                        {evaluation.title}
                      </h3>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {evaluation.type.toUpperCase()}
                      </span>
                      {evaluation.status === 'closed' && (
                        <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                          CLOSED
                        </span>
                      )}
                    </div>

                    <p className="mb-3 text-sm text-gray-600">
                      {evaluation.description || 'No description'}
                    </p>

                    <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <span className="text-gray-500">Total Marks:</span>
                        <span className="ml-2 font-medium">
                          {evaluation.totalMarks}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <span className="ml-2 font-medium">
                          {evaluation.weight}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Passing:</span>
                        <span className="ml-2 font-medium">
                          {evaluation.passingGrade || 50}%
                        </span>
                      </div>
                      {evaluation.isGraded && (
                        <div>
                          <span className="text-gray-500">Your Score:</span>
                          <span
                            className={`ml-2 font-medium ${
                              evaluation.isPassed
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {evaluation.score}/{evaluation.totalMarks}
                            {evaluation.isPassed ? ' ✓' : ' ✗'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Attempt info */}
                    {evaluation.attemptNumber > 0 && (
                      <p className="mb-2 text-xs text-gray-500">
                        Attempt #{evaluation.attemptNumber}
                        {evaluation.retakesRemaining === -1
                          ? ' (unlimited retakes)'
                          : evaluation.retakesRemaining > 0
                            ? ` (${evaluation.retakesRemaining} retake${evaluation.retakesRemaining > 1 ? 's' : ''} remaining)`
                            : ''}
                      </p>
                    )}

                    {/* Status indicator */}
                    {evaluation.hasSubmitted ? (
                      evaluation.isGraded ? (
                        evaluation.isPassed ? (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Passed ✓
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Did not pass
                            {evaluation.canRetake && ' - Retake available'}
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-yellow-600">
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Submitted - Awaiting Grade
                        </div>
                      )
                    ) : evaluation.status === 'closed' ? (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Closed - Not Submitted
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Not Started
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {evaluation.hasSubmitted ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate(`/evaluations/${evaluation._id}/view`)
                          }
                        >
                          View Submission
                        </Button>
                        {evaluation.canRetake &&
                          evaluation.status !== 'closed' && (
                            <Button
                              onClick={() =>
                                navigate(
                                  `/evaluations/${evaluation._id}/attempt`
                                )
                              }
                              className="bg-orange-500 text-white hover:bg-orange-600"
                            >
                              Retake
                            </Button>
                          )}
                      </>
                    ) : evaluation.status === 'closed' ? (
                      <Button variant="secondary" disabled>
                        Closed
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          navigate(`/evaluations/${evaluation._id}/attempt`)
                        }
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
