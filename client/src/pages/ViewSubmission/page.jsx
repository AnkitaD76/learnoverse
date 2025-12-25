import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  getEvaluationById,
  getMySubmission,
  getEvaluationSubmissions,
  gradeSubmission,
} from '../../api/evaluations';
import { useSession } from '../../contexts/SessionContext';

export const ViewSubmissionPage = () => {
  const { evaluationId } = useParams();
  const [searchParams] = useSearchParams();
  const submissionIdParam = searchParams.get('submissionId');
  const navigate = useNavigate();
  const { user } = useSession();

  const [evaluation, setEvaluation] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    totalScore: '',
    feedback: '',
  });
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [evaluationId, submissionIdParam]);

  const fetchData = async () => {
    try {
      const evalRes = await getEvaluationById(evaluationId);
      setEvaluation(evalRes.evaluation);

      // Check if user is instructor
      const instructorCheck =
        user &&
        (user.role === 'admin' ||
          String(user._id) === String(evalRes.evaluation.course?.instructor));
      setIsInstructor(instructorCheck);

      // If submissionId is provided (instructor viewing specific submission)
      if (submissionIdParam && instructorCheck) {
        const subsRes = await getEvaluationSubmissions(evaluationId);
        const specificSubmission = subsRes.submissions?.find(
          s => String(s._id) === String(submissionIdParam)
        );
        if (specificSubmission) {
          setSubmission(specificSubmission);
          if (specificSubmission.status === 'graded') {
            setGradeForm({
              totalScore: specificSubmission.totalScore || 0,
              feedback: specificSubmission.feedback || '',
            });
          }
        } else {
          alert('Submission not found');
          navigate(-1);
        }
      } else {
        // Student viewing their own submission
        const submissionRes = await getMySubmission(evaluationId);
        setSubmission(submissionRes.submission);

        if (!submissionRes.submission) {
          alert('You have not submitted this evaluation yet');
          navigate(-1);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load submission');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async e => {
    e.preventDefault();
    if (!submission) return;

    if (submission.status === 'graded') {
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
      await gradeSubmission(submission._id, {
        totalScore: score,
        feedback: gradeForm.feedback,
      });

      alert('Submission graded successfully');
      fetchData(); // Reload to show updated grade
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
      <div className="mx-auto mt-8 max-w-4xl">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          ← Back
        </Button>

        <Card className="mb-6 p-6">
          <h1 className="mb-2 text-2xl font-bold">{evaluation?.title}</h1>
          <div className="mb-4 flex items-center gap-4 text-sm">
            <span className="rounded bg-blue-100 px-2 py-1 font-medium text-blue-700">
              {evaluation?.type.toUpperCase()}
            </span>
            <span className="text-gray-600">
              Total Marks: {evaluation?.totalMarks}
            </span>
            <span className="text-gray-600">Weight: {evaluation?.weight}%</span>
          </div>

          {/* Status */}
          <div
            className={`rounded p-4 ${
              submission?.status === 'graded'
                ? 'border border-green-200 bg-green-50'
                : 'border border-yellow-200 bg-yellow-50'
            }`}
          >
            {submission?.status === 'graded' ? (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold text-green-800">Graded</span>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {submission.totalScore}/{evaluation.totalMarks}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Graded on: {new Date(submission.gradedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold text-yellow-800">
                    Pending Grading
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Submitted on:{' '}
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Feedback */}
          {submission?.status === 'graded' && submission?.feedback && (
            <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">
                Instructor Feedback
              </h3>
              <p className="whitespace-pre-wrap text-gray-700">
                {submission.feedback}
              </p>
            </div>
          )}
        </Card>

        {/* Instructor Grading Form */}
        {isInstructor && submission?.status === 'submitted' && (
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-xl font-semibold">Grade Submission</h2>
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Total Score (out of {evaluation.totalMarks})
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
                {grading ? <LoadingSpinner /> : 'Submit Grade (Irreversible)'}
              </Button>
            </form>
          </Card>
        )}

        {/* Student Info for Instructor */}
        {isInstructor && submission && (
          <Card className="mb-6 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Student Information
            </h3>
            <p className="text-sm">
              <span className="font-medium">Name:</span>{' '}
              {submission.student?.name || 'N/A'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span>{' '}
              {submission.student?.email || 'N/A'}
            </p>
          </Card>
        )}

        {/* Answers */}
        <div className="space-y-6">
          {submission?.answers?.map((answer, index) => {
            const question =
              evaluation?.questions?.find(
                q =>
                  String(q._id) ===
                  String(answer.questionId._id || answer.questionId)
              ) || answer.questionId;

            return (
              <Card key={index} className="p-6">
                <div className="mb-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold">
                      Question {index + 1}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {question?.maxMarks || 0} marks
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {question?.prompt || 'Question not found'}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-600">
                    Your Answer
                  </h4>
                  <div className="rounded border bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap text-gray-800">
                      {answer.responseText}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
