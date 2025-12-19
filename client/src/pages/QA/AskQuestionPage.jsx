import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuestion } from '../../api/qa';
import MarkdownEditor from '../../components/qa/MarkdownEditor';
import './AskQuestionPage.css';

/**
 * Ask Question Page
 * Form to create a new question
 */
const AskQuestionPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    // Validation
    const newErrors = {};

    if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (formData.body.trim().length < 20) {
      newErrors.body = 'Question body must be at least 20 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Parse tags
      const tags = formData.tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const response = await createQuestion({
        title: formData.title.trim(),
        body: formData.body.trim(),
        tags,
      });

      // Redirect to the new question
      navigate(`/qa/${response.question._id}`);
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Failed to create question',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ask-question-page">
      <div className="page-header">
        <h1>Ask a Question</h1>
        <p>
          Get help from the community. Be specific and clear in your question.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="ask-question-form">
        <div className="form-group">
          <label htmlFor="title">
            Question Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., How do I implement authentication in React?"
            maxLength={200}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
          <small>Be specific and imagine you're asking another person.</small>
        </div>

        <div className="form-group">
          <label htmlFor="body">
            Question Details <span className="required">*</span>
          </label>
          <MarkdownEditor
            value={formData.body}
            onChange={value => setFormData({ ...formData, body: value })}
            placeholder="Describe your problem in detail. Include what you've tried and what you expect to happen."
            minLength={20}
            maxLength={30000}
          />
          {errors.body && <span className="error-text">{errors.body}</span>}
          <small>
            Include all relevant details. Use code blocks for code snippets.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            placeholder="javascript, react, api (comma-separated)"
            className={errors.tags ? 'error' : ''}
          />
          {errors.tags && <span className="error-text">{errors.tags}</span>}
          <small>Add up to 5 tags to describe your question topic.</small>
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/qa')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </form>

      <div className="tips-section">
        <h3>Tips for asking a good question:</h3>
        <ul>
          <li>Search to see if your question has already been asked</li>
          <li>Write a clear, specific title</li>
          <li>Include what you've tried and what went wrong</li>
          <li>Provide relevant code snippets</li>
          <li>Add appropriate tags</li>
        </ul>
      </div>
    </div>
  );
};

export default AskQuestionPage;
