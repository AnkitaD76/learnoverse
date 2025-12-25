import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  createEvaluation,
  updateEvaluation,
  publishEvaluation,
  getEvaluationById,
} from '../../api/evaluations';
import { useSession } from '../../contexts/SessionContext';

const emptyQuestion = () => ({
  prompt: '',
  maxMarks: 10,
});

export const CreateEvaluationPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();

  const [form, setForm] = useState({
    type: 'assignment',
    title: '',
    description: '',
    totalMarks: 100,
    weight: 10,
    questions: [emptyQuestion()],
  });

  const [loading, setLoading] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(true);

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="mx-auto mt-8 max-w-2xl">
          <p className="text-red-500">
            Only instructors can create evaluations.
          </p>
        </Card>
      </div>
    );
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateQuestion = (idx, field, value) => {
    setForm(prev => {
      const next = [...prev.questions];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, questions: next };
    });
  };

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion()],
    }));
  };

  const removeQuestion = idx => {
    if (form.questions.length <= 1) {
      alert('At least one question is required');
      return;
    }
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  const calculateTotalMarks = () => {
    return form.questions.reduce(
      (sum, q) => sum + (parseInt(q.maxMarks) || 0),
      0
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!form.title.trim()) {
        throw new Error('Title is required');
      }

      if (form.questions.some(q => !q.prompt.trim())) {
        throw new Error('All questions must have a prompt');
      }

      const totalFromQuestions = calculateTotalMarks();
      if (totalFromQuestions !== parseInt(form.totalMarks)) {
        throw new Error(
          `Sum of question marks (${totalFromQuestions}) must equal total marks (${form.totalMarks})`
        );
      }

      const payload = {
        type: form.type,
        title: form.title,
        description: form.description,
        totalMarks: parseInt(form.totalMarks),
        weight: parseFloat(form.weight),
        questions: form.questions.map(q => ({
          prompt: q.prompt,
          maxMarks: parseInt(q.maxMarks),
        })),
      };

      const res = await createEvaluation(courseId, payload);

      // Optionally publish immediately
      if (!saveAsDraft && res.evaluation?._id) {
        await publishEvaluation(res.evaluation._id);
        alert('Evaluation created and published successfully!');
      } else {
        alert('Evaluation saved as draft');
      }

      navigate(`/courses/${courseId}/evaluations`);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          'Failed to create evaluation'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="mx-auto mt-8 max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">Create Evaluation</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2"
                required
              >
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            <Input
              label="Weight (%)"
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              required
            />
          </div>

          <Input
            label="Title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Final Assignment"
            required
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Instructions for students..."
            />
          </div>

          <Input
            label="Total Marks"
            type="number"
            name="totalMarks"
            value={form.totalMarks}
            onChange={handleChange}
            min="1"
            required
          />

          <div className="text-sm text-gray-600">
            Sum of question marks:{' '}
            <span className="font-semibold">{calculateTotalMarks()}</span>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Questions</h2>
              <Button type="button" onClick={addQuestion} variant="secondary">
                + Add Question
              </Button>
            </div>

            {form.questions.map((question, idx) => (
              <Card key={idx} className="bg-gray-50 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-medium">Question {idx + 1}</h3>
                  {form.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Question Prompt
                    </label>
                    <textarea
                      value={question.prompt}
                      onChange={e =>
                        updateQuestion(idx, 'prompt', e.target.value)
                      }
                      rows={3}
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="Enter the question..."
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Max Marks
                    </label>
                    <input
                      type="number"
                      value={question.maxMarks}
                      onChange={e =>
                        updateQuestion(idx, 'maxMarks', e.target.value)
                      }
                      min="1"
                      className="w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Submit Options */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="saveAsDraft"
              checked={saveAsDraft}
              onChange={e => setSaveAsDraft(e.target.checked)}
            />
            <label htmlFor="saveAsDraft" className="text-sm">
              Save as draft (can edit later)
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <LoadingSpinner />
              ) : saveAsDraft ? (
                'Save Draft'
              ) : (
                'Create & Publish'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/courses/${courseId}/evaluations`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
