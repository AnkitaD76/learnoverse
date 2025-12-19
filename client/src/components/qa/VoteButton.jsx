import { useState } from 'react';
import PropTypes from 'prop-types';
import './qa-components.css';

/**
 * VoteButton Component
 * Handles upvote/downvote UI for questions and answers
 */ 
const VoteButton = ({ voteScore, userVote, onVote, disabled = false }) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async value => {
    if (disabled || isVoting) return;
    setIsVoting(true);
    try {
      await onVote(value);
    } finally { 
      setIsVoting(false);
    }
  };

  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn vote-up ${userVote === 1 ? 'active' : ''}`}
        onClick={() => handleVote(1)}
        disabled={disabled || isVoting}
        title="Upvote"
      >
        ▲
      </button>
      <span
        className={`vote-score ${voteScore > 0 ? 'positive' : voteScore < 0 ? 'negative' : ''}`}
      >
        {voteScore}
      </span>
      <button
        className={`vote-btn vote-down ${userVote === -1 ? 'active' : ''}`}
        onClick={() => handleVote(-1)}
        disabled={disabled || isVoting}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
};

VoteButton.propTypes = {
  voteScore: PropTypes.number.isRequired,
  userVote: PropTypes.oneOf([1, -1, null]),
  onVote: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default VoteButton;
