import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
import {
  getQuestionById,
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  updateQuestion,
  deleteQuestion,
  acceptAnswer,
  unacceptAnswer,
  vote,
} from '../../api/qa';
import VoteButton from '../../components/qa/VoteButton';
import AnswerCard from '../../components/qa/AnswerCard';
import TagList from '../../components/qa/TagList';
import MarkdownEditor from '../../components/qa/MarkdownEditor';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import './QuestionDetailPage.css';

/**
 * Question Detail Page
 * View question with all answers, voting, and answer submission
 */
const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSession();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [questionUserVote, setQuestionUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Answer form state
  const [answerBody, setAnswerBody] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  // Edit states
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editAnswerBody, setEditAnswerBody] = useState('');

  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editQuestionData, setEditQuestionData] = useState({
    title: '',
    body: '',
    tags: '',
  });

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
  }, [id]);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getQuestionById(id);
      setQuestion(data.question);
      setQuestionUserVote(data.userVote);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      const data = await getAnswers(id, { sort: 'votes' });
      setAnswers(data.answers);
      setUserVotes(data.userVotes || {});
    } catch (err) {
      console.error('Failed to load answers:', err);
    }
  };

  const handleQuestionVote = async value => {
    try {
      const data = await vote({
        targetType: 'Question',
        targetId: id,
        value,
      });

      setQuestion({ ...question, voteScore: data.voteScore });
      setQuestionUserVote(data.userVote);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to vote');
    }
  };

  const handleAnswerVote = async (answerId, value) => {
    try {
      const data = await vote({
        targetType: 'Answer',
        targetId: answerId,
        value,
      });

      // Update answer score in list
      setAnswers(
        answers.map(a =>
          a._id === answerId ? { ...a, voteScore: data.voteScore } : a
        )
      );

      // Update user vote
      setUserVotes({
        ...userVotes,
        [answerId]: data.userVote,
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to vote');
    }
  };

  const handleSubmitAnswer = async e => {
    e.preventDefault();

    if (answerBody.trim().length < 10) {
      setAnswerError('Answer must be at least 10 characters');
      return;
    }

    setIsSubmittingAnswer(true);
    setAnswerError(null);

    try {
      await createAnswer(id, { body: answerBody.trim() });
      setAnswerBody('');
      fetchAnswers();
      fetchQuestion(); // Refresh to update answer count
    } catch (err) {
      setAnswerError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async answerId => {
    try {
      await acceptAnswer(answerId);
      fetchAnswers();
      fetchQuestion();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept answer');
    }
  };

  const handleEditAnswer = answer => {
    setEditingAnswer(answer._id);
    setEditAnswerBody(answer.body);
  };

  const handleSaveEditAnswer = async () => {
    try {
      await updateAnswer(editingAnswer, { body: editAnswerBody });
      setEditingAnswer(null);
      fetchAnswers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update answer');
    }
  };

  const handleDeleteAnswer = async answerId => {
    if (!confirm('Are you sure you want to delete this answer?')) return;

    try {
      await deleteAnswer(answerId);
      fetchAnswers();
      fetchQuestion();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete answer');
    }
  };

  const handleEditQuestion = () => {
    setEditingQuestion(true);
    setEditQuestionData({
      title: question.title,
      body: question.body,
      tags: question.tags.map(t => t.name).join(', '),
    });
  };

  const handleSaveEditQuestion = async () => {
    try {
      const tags = editQuestionData.tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      await updateQuestion(id, {
        title: editQuestionData.title,
        body: editQuestionData.body,
        tags,
      });

      setEditingQuestion(false);
      fetchQuestion();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update question');
    }
  };

  const handleDeleteQuestion = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this question? This cannot be undone.'
      )
    )
      return;

    try {
      await deleteQuestion(id);
      navigate('/qa');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const renderMarkdown = text => {
    if (!text) return '';
    let html = text;
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
    html = html.replace(/\n/gim, '<br>');
    return html;
  };

  const formatDate = date => {
    return new Date(date).toLocaleString();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (!question) return <div>Question not found</div>;

  const isQuestionAuthor = user?.userId === question.author?._id;
  const canAnswerQuestion = isAuthenticated && user?.isVerified;

  return (
    <div className="question-detail-page">
      <div className="question-section">
        {editingQuestion ? (
          <div className="edit-question-form">
            <input
              type="text"
              value={editQuestionData.title}
              onChange={e =>
                setEditQuestionData({
                  ...editQuestionData,
                  title: e.target.value,
                })
              }
              className="edit-title-input"
            />
            <MarkdownEditor
              value={editQuestionData.body}
              onChange={value =>
                setEditQuestionData({ ...editQuestionData, body: value })
              }
            />
            <input
              type="text"
              value={editQuestionData.tags}
              onChange={e =>
                setEditQuestionData({
                  ...editQuestionData,
                  tags: e.target.value,
                })
              }
              placeholder="Tags (comma-separated)"
              className="edit-tags-input"
            />
            <div className="edit-actions">
              <button
                className="btn-secondary"
                onClick={() => setEditingQuestion(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveEditQuestion}>
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="question-title">{question.title}</h1>

            <div className="question-meta">
              <span>Asked {formatDate(question.createdAt)}</span>
              <span>Viewed {question.viewCount} times</span>
              {question.lastActivityAt !== question.createdAt && (
                <span>Active {formatDate(question.lastActivityAt)}</span>
              )}
            </div>

            <div className="question-body-section">
              <VoteButton
                voteScore={question.voteScore}
                userVote={questionUserVote}
                onVote={handleQuestionVote}
                disabled={!isAuthenticated}
              />

              <div className="question-content">
                <div
                  className="question-body"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(question.body),
                  }}
                />

                <div className="question-footer">
                  <TagList tags={question.tags} />

                  <div className="question-author">
                    <span className="author-name">
                      {question.author?.name || 'Anonymous'}
                    </span>
                    <span className="author-reputation">
                      {question.author?.reputation || 0} reputation
                    </span>
                  </div>
                </div>

                {isQuestionAuthor && (
                  <div className="question-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={handleEditQuestion}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={handleDeleteQuestion}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="answers-section">
        <h2>
          {question.answerCount}{' '}
          {question.answerCount === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.map(answer => (
          <div key={answer._id}>
            {editingAnswer === answer._id ? (
              <div className="edit-answer-form">
                <MarkdownEditor
                  value={editAnswerBody}
                  onChange={setEditAnswerBody}
                />
                <div className="edit-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setEditingAnswer(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleSaveEditAnswer}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <AnswerCard
                answer={answer}
                userVote={userVotes[answer._id] || null}
                onVote={value => handleAnswerVote(answer._id, value)}
                onAccept={() => handleAcceptAnswer(answer._id)}
                onEdit={() => handleEditAnswer(answer)}
                onDelete={() => handleDeleteAnswer(answer._id)}
                canAccept={isQuestionAuthor && !question.acceptedAnswer}
                canEdit={user?.userId === answer.author?._id}
                canDelete={
                  user?.userId === answer.author?._id || user?.role === 'admin'
                }
              />
            )}
          </div>
        ))}
      </div>

      {canAnswerQuestion ? (
        <div className="answer-form-section">
          <h3>Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <MarkdownEditor
              value={answerBody}
              onChange={setAnswerBody}
              placeholder="Write your answer here..."
              minLength={10}
            />
            {answerError && <div className="error-message">{answerError}</div>}
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmittingAnswer}
            >
              {isSubmittingAnswer ? 'Submitting...' : 'Post Your Answer'}
            </button>
          </form>
        </div>
      ) : (
        <div className="login-prompt">
          <p>
            You must be logged in and verified to answer questions.{' '}
            <a href="/login">Log in</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionDetailPage;
