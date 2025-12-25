import { useState } from 'react';
import PropTypes from 'prop-types';
import VoteButton from './VoteButton';
import ReportButton from '../ReportButton';
import './qa-components.css';

/**
 * AnswerCard Component
 * Displays a single answer with voting, accept, edit, delete
 */
const AnswerCard = ({
  answer,
  userVote,
  onVote,
  onAccept,
  onEdit,
  onDelete,
  onReport,
  canAccept = false,
  canEdit = false,
  canDelete = false,
  currentUserId,
}) => {
  const [showEditHistory, setShowEditHistory] = useState(false);

  const formatDate = date => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  // Simple markdown rendering
  const renderMarkdown = text => {
    if (!text) return '';
    let html = text;
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
    html = html.replace(/\n/gim, '<br>');
    return html;
  };

  return (
    <div className={`answer-card ${answer.isAccepted ? 'accepted' : ''}`}>
      {answer.isAccepted && (
        <div className="accepted-badge">✓ Accepted Answer</div>
      )}

      <div className="answer-body-section">
        <VoteButton
          voteScore={answer.voteScore}
          userVote={userVote}
          onVote={onVote}
        />

        <div className="answer-content">
          <div
            className="answer-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(answer.body) }}
          />

          <div className="answer-footer">
            <div className="answer-actions">
              {canAccept && !answer.isAccepted && (
                <button className="action-btn accept-btn" onClick={onAccept}>
                  Accept Answer
                </button>
              )}
              {canEdit && (
                <button className="action-btn edit-btn" onClick={onEdit}>
                  Edit
                </button>
              )}
              {canDelete && (
                <button className="action-btn delete-btn" onClick={onDelete}>
                  Delete
                </button>
              )}
              {currentUserId &&
                answer.author?._id !== currentUserId &&
                onReport && (
                  <ReportButton
                    variant="icon"
                    onReport={onReport}
                    className="ml-2"
                  />
                )}
              {answer.editHistory && answer.editHistory.length > 0 && (
                <button
                  className="action-btn"
                  onClick={() => setShowEditHistory(!showEditHistory)}
                >
                  {showEditHistory ? 'Hide' : 'Show'} Edit History (
                  {answer.editHistory.length})
                </button>
              )}
            </div>

            <div className="answer-meta">
              <span className="author">
                {answer.author?.name || 'Anonymous'}
              </span>
              <span className="reputation">
                {answer.author?.reputation || 0} rep
              </span>
              <span className="timestamp">
                answered {formatDate(answer.createdAt)}
              </span>
              {answer.updatedAt !== answer.createdAt && (
                <span className="edited">
                  (edited {formatDate(answer.updatedAt)})
                </span>
              )}
            </div>
          </div>

          {showEditHistory &&
            answer.editHistory &&
            answer.editHistory.length > 0 && (
              <div className="edit-history">
                <h4>Edit History</h4>
                {answer.editHistory.map((edit, index) => (
                  <div key={index} className="edit-item">
                    <span className="edit-date">
                      {formatDate(edit.editedAt)}
                    </span>
                    <div
                      className="edit-body"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(edit.previousBody),
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

AnswerCard.propTypes = {
  answer: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    voteScore: PropTypes.number,
    isAccepted: PropTypes.bool,
    author: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      reputation: PropTypes.number,
    }),
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    editHistory: PropTypes.array,
  }).isRequired,
  userVote: PropTypes.oneOf([1, -1, null]),
  onVote: PropTypes.func.isRequired,
  onAccept: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canAccept: PropTypes.bool,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};

export default AnswerCard;
