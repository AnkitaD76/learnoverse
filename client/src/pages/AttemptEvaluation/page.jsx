import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  getEvaluationById,
  submitEvaluation,
  getMySubmission,
} from '../../api/evaluations';

export const AttemptEvaluationPage = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvaluation();
  }, [evaluationId]);

  const fetchEvaluation = async () => {
    try {
      const [evalRes, submissionRes] = await Promise.all([
        getEvaluationById(evaluationId),
        getMySubmission(evaluationId),
      ]);

      // Check if already submitted
      // if (submissionRes.submission) {
      //   alert('You have already submitted this evaluation');
      //   navigate(`/evaluations/${evaluationId}/view`);
      //   return;
      // }

      setEvaluation(evalRes.evaluation);

      // Initialize answers array
      const initialAnswers = (evalRes.evaluation.questions || []).map(q => ({
        questionId: q._id,
        responseText: '',
      }));
      setAnswers(initialAnswers);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          'Failed to load evaluation'
      );
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], responseText: value };
      return next;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate all questions answered
    const unanswered = answers.filter(a => !a.responseText.trim());
    if (unanswered.length > 0) {
      alert('Please answer all questions before submitting');
      return;
    }

    if (
      !confirm(
        'Are you sure you want to submit? You cannot edit your submission after submitting.'
      )
    ) {
      return;
    }

    setSubmitting(true);

    try {
      await submitEvaluation(evaluationId, answers);
      alert('Evaluation submitted successfully!');
      navigate(`/evaluations/${evaluationId}/view`);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          'Failed to submit evaluation'
      );
    } finally {
      setSubmitting(false);
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
          <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
            <span className="rounded bg-blue-100 px-2 py-1 font-medium text-blue-700">
              {evaluation?.type.toUpperCase()}
            </span>
            <span>Total Marks: {evaluation?.totalMarks}</span>
            <span>Weight: {evaluation?.weight}%</span>
          </div>
          {evaluation?.description && (
            <p className="mb-4 text-gray-700">{evaluation.description}</p>
          )}
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Important:</strong> You can only submit once. Make sure
              to review all your answers before submitting.
            </p>
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {evaluation?.questions?.map((question, index) => (
              <Card key={question._id} className="p-6">
                <div className="mb-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold">
                      Question {index + 1}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {question.maxMarks} marks
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {question.prompt}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Your Answer
                  </label>
                  <textarea
                    value={answers[index]?.responseText || ''}
                    onChange={e => handleAnswerChange(index, e.target.value)}
                    rows={6}
                    className="w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your answer here..."
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {answers[index]?.responseText.length || 0} characters
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-6 p-6">
            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? <LoadingSpinner /> : 'Submit Evaluation'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};
