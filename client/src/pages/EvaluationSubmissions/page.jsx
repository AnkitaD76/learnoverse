import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  getEvaluationById,
  getEvaluationSubmissions,
  gradeSubmission,
} from '../../api/evaluations';

export const EvaluationSubmissionsPage = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    totalScore: '',
    feedback: '',
  });
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [evaluationId]);

  const fetchData = async () => {
    try {
      const [evalRes, subsRes] = await Promise.all([
        getEvaluationById(evaluationId),
        getEvaluationSubmissions(evaluationId),
      ]);

      setEvaluation(evalRes.evaluation);
      setSubmissions(subsRes.submissions || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = submission => {
    setSelectedSubmission(submission);
    if (submission.status === 'graded') {
      setGradeForm({
        totalScore: submission.totalScore || 0,
        feedback: submission.feedback || '',
      });
    } else {
      setGradeForm({ totalScore: '', feedback: '' });
    }
  };

  const handleGradeSubmit = async e => {
    e.preventDefault();
    if (!selectedSubmission) return;

    if (selectedSubmission.status === 'graded') {
      alert('This submission has already been graded and cannot be modified.');
      return;
    }

    // Convert and validate score
    const score = parseFloat(gradeForm.totalScore);
    if (
      gradeForm.totalScore === '' ||
      isNaN(score) ||
      score < 0 ||
      score > evaluation.totalMarks
    ) {
      alert(
        `Score must be a valid number between 0 and ${evaluation.totalMarks}`
      );
      return;
    }

    if (!confirm('Are you sure? Grades cannot be modified once submitted.')) {
      return;
    }

    setGrading(true);

    try {
      await gradeSubmission(selectedSubmission._id, {
        totalScore: score,
        feedback: gradeForm.feedback,
      });

      alert('Submission graded successfully');
      setSelectedSubmission(null);
      setGradeForm({ totalScore: '', feedback: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          'Failed to grade submission'
      );
    } finally {
      setGrading(false);
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
      <div className="mx-auto mt-8 max-w-7xl">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          ← Back
        </Button>

        <h1 className="mb-2 text-2xl font-bold">
          {evaluation?.title} - Submissions
        </h1>
        <p className="mb-6 text-gray-600">
          Total Marks: {evaluation?.totalMarks} | Weight: {evaluation?.weight}%
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Submissions List */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Submissions ({submissions.length})
            </h2>

            {submissions.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                No submissions yet
              </Card>
            ) : (
              <div className="space-y-3">
                {submissions.map(submission => (
                  <Card
                    key={submission._id}
                    className={`p-4 transition ${
                      selectedSubmission?._id === submission._id
                        ? 'ring-2 ring-blue-500'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => handleSelectSubmission(submission)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {submission.student?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {submission.student?.email}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Submitted:{' '}
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              submission.status === 'graded'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {submission.status === 'graded'
                              ? 'Graded'
                              : 'Pending'}
                          </span>
                          {submission.status === 'graded' && (
                            <p className="mt-1 text-sm font-semibold">
                              {submission.totalScore}/{evaluation.totalMarks}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          navigate(
                            `/evaluations/${evaluationId}/view?submissionId=${submission._id}`
                          )
                        }
                        className="w-full text-xs"
                      >
                        View Full Submission & Grade
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Grading Panel */}
          <div>
            {!selectedSubmission ? (
              <Card className="p-6 text-center text-gray-500">
                Select a submission to view and grade
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">
                  {selectedSubmission.student?.name}'s Submission
                </h2>

                {/* Answers */}
                <div className="mb-6 max-h-96 space-y-4 overflow-y-auto">
                  {selectedSubmission.answers?.map((answer, idx) => {
                    const question = evaluation.questions?.find(
                      q =>
                        String(q._id) ===
                        String(answer.questionId._id || answer.questionId)
                    );

                    return (
                      <div key={idx} className="border-b pb-4">
                        <p className="mb-1 font-medium">Question {idx + 1}</p>
                        <p className="mb-2 text-sm text-gray-600">
                          {question?.prompt ||
                            answer.questionId?.prompt ||
                            'Question not found'}
                        </p>
                        <p className="mb-2 text-xs text-gray-500">
                          Max Marks:{' '}
                          {question?.maxMarks ||
                            answer.questionId?.maxMarks ||
                            0}
                        </p>
                        <div className="rounded bg-gray-50 p-3">
                          <p className="text-sm whitespace-pre-wrap">
                            {answer.responseText}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grading Form */}
                {selectedSubmission.status === 'graded' ? (
                  <div className="rounded bg-green-50 p-4">
                    <p className="mb-2 font-semibold text-green-800">
                      Already Graded
                    </p>
                    <p className="mb-1 text-sm">
                      Score: {selectedSubmission.totalScore}/
                      {evaluation.totalMarks}
                    </p>
                    {selectedSubmission.feedback && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Feedback:</p>
                        <p className="text-sm text-gray-700">
                          {selectedSubmission.feedback}
                        </p>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Graded on:{' '}
                      {new Date(selectedSubmission.gradedAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleGradeSubmit} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Total Score (max: {evaluation.totalMarks})
                      </label>
                      <input
                        type="number"
                        value={gradeForm.totalScore}
                        onChange={e =>
                          setGradeForm(prev => ({
                            ...prev,
                            totalScore: e.target.value,
                          }))
                        }
                        min="0"
                        max={evaluation.totalMarks}
                        step="0.01"
                        className="w-full rounded-md border px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Feedback (Optional)
                      </label>
                      <textarea
                        value={gradeForm.feedback}
                        onChange={e =>
                          setGradeForm(prev => ({
                            ...prev,
                            feedback: e.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full rounded-md border px-3 py-2"
                        placeholder="Provide feedback to the student..."
                      />
                    </div>

                    <Button type="submit" disabled={grading} className="w-full">
                      {grading ? (
                        <LoadingSpinner />
                      ) : (
                        'Submit Grade (Irreversible)'
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
