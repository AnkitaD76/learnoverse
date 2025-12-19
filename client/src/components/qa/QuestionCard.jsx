import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import TagList from './TagList';
import './qa-components.css';

/**
 * QuestionCard Component
 * Displays a question summary in the list view
 */
const QuestionCard = ({ question }) => {
  const formatDate = date => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="question-card">
      <div className="question-stats">
        <div className="stat-item">
          <span
            className={`stat-value ${question.voteScore > 0 ? 'positive' : question.voteScore < 0 ? 'negative' : ''}`}
          >
            {question.voteScore}
          </span>
          <span className="stat-label">votes</span>
        </div>
        <div
          className={`stat-item ${question.acceptedAnswer ? 'accepted' : ''}`}
        >
          <span className="stat-value">{question.answerCount}</span>
          <span className="stat-label">answers</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{question.viewCount}</span>
          <span className="stat-label">views</span>
        </div>
      </div>

      <div className="question-content">
        <h3 className="question-title">
          <Link to={`/qa/${question._id}`}>{question.title}</Link>
        </h3>

        <div className="question-excerpt">
          {question.body.substring(0, 200)}
          {question.body.length > 200 ? '...' : ''}
        </div>

        <div className="question-footer">
          <TagList tags={question.tags} />

          <div className="question-meta">
            <span className="author">
              {question.author?.name || 'Anonymous'}
            </span>
            <span className="reputation">
              {question.author?.reputation || 0} rep
            </span>
            <span className="timestamp">
              asked {formatDate(question.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

QuestionCard.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    voteScore: PropTypes.number,
    answerCount: PropTypes.number,
    viewCount: PropTypes.number,
    acceptedAnswer: PropTypes.string,
    tags: PropTypes.array,
    author: PropTypes.shape({
      name: PropTypes.string,
      reputation: PropTypes.number,
    }),
    createdAt: PropTypes.string,
  }).isRequired,
};

export default QuestionCard;
