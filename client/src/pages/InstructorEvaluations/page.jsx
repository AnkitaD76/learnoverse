import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  getInstructorEvaluations,
  publishEvaluation,
  closeEvaluation,
} from '../../api/evaluations';
import { useSession } from '../../contexts/SessionContext';

export const InstructorEvaluationsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, [courseId]);

  const fetchEvaluations = async () => {
    try {
      const res = await getInstructorEvaluations(courseId);
      setEvaluations(res.evaluations || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async evaluationId => {
    if (!confirm('Are you sure you want to publish this evaluation?')) {
      return;
    }

    try {
      await publishEvaluation(evaluationId);
      alert('Evaluation published successfully');
      fetchEvaluations();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          'Failed to publish'
      );
    }
  };

  const handleClose = async evaluationId => {
    if (
      !confirm(
        'Are you sure you want to close this evaluation? No more submissions will be accepted.'
      )
    ) {
      return;
    }

    try {
      await closeEvaluation(evaluationId);
      alert('Evaluation closed successfully');
      fetchEvaluations();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          'Failed to close'
      );
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
      <div className="mx-auto mt-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Evaluations (Instructor View)</h1>
          <Button
            onClick={() => navigate(`/courses/${courseId}/evaluations/create`)}
          >
            + Create Evaluation
          </Button>
        </div>

        {evaluations.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="mb-4 text-gray-500">No evaluations yet</p>
            <Button
              onClick={() =>
                navigate(`/courses/${courseId}/evaluations/create`)
              }
            >
              Create First Evaluation
            </Button>
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
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          evaluation.status === 'draft'
                            ? 'bg-gray-200 text-gray-700'
                            : evaluation.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {evaluation.status.toUpperCase()}
                      </span>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {evaluation.type.toUpperCase()}
                      </span>
                    </div>

                    <p className="mb-3 text-sm text-gray-600">
                      {evaluation.description || 'No description'}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
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
                        <span className="text-gray-500">Submissions:</span>
                        <span className="ml-2 font-medium">
                          {evaluation.submissionCount || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Graded:</span>
                        <span className="ml-2 font-medium">
                          {evaluation.gradedCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex gap-2">
                    {evaluation.status === 'draft' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate(`/evaluations/${evaluation._id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                        <Button onClick={() => handlePublish(evaluation._id)}>
                          Publish
                        </Button>
                      </>
                    )}

                    {evaluation.status === 'published' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate(
                              `/evaluations/${evaluation._id}/submissions`
                            )
                          }
                        >
                          View Submissions ({evaluation.submissionCount || 0})
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleClose(evaluation._id)}
                        >
                          Close
                        </Button>
                      </>
                    )}

                    {evaluation.status === 'closed' && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          navigate(`/evaluations/${evaluation._id}/submissions`)
                        }
                      >
                        View Submissions ({evaluation.submissionCount || 0})
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
