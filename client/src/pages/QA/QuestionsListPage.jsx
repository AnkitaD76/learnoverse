import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getQuestions } from '../../api/qa';
import QuestionCard from '../../components/qa/QuestionCard';
import Pagination from '../../components/qa/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import './QuestionsListPage.css';

/**
 * Questions List Page
 * Main Q&A landing page with filters and search
 */
const QuestionsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters from URL params
  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, [search, tag, sort, page]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getQuestions({
        search,
        tag,
        sort,
        page,
        limit: 20,
      });

      setQuestions(data.questions);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const updateParams = updates => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset to page 1 when changing filters
    if (!updates.page) {
      newParams.set('page', '1');
    }

    setSearchParams(newParams);
  };

  const handleSearch = e => {
    e.preventDefault();
    const searchValue = e.target.search.value;
    updateParams({ search: searchValue });
  };

  const handleSortChange = newSort => {
    updateParams({ sort: newSort });
  };

  const handlePageChange = newPage => {
    updateParams({ page: newPage });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="qa-page">
      <div className="qa-header">
        <div className="qa-header-content">
          <h1>Community Q&A</h1>
          <button className="btn-primary" onClick={() => navigate('/qa/ask')}>
            Ask Question
          </button>
        </div>

        <form onSubmit={handleSearch} className="qa-search-form">
          <input
            type="text"
            name="search"
            placeholder="Search questions..."
            defaultValue={search}
            className="search-input"
          />
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>
      </div>

      <div className="qa-filters">
        <div className="filter-group">
          <span className="filter-label">Sort by:</span>
          <button
            className={`filter-btn ${sort === 'newest' ? 'active' : ''}`}
            onClick={() => handleSortChange('newest')}
          >
            Newest
          </button>
          <button
            className={`filter-btn ${sort === 'votes' ? 'active' : ''}`}
            onClick={() => handleSortChange('votes')}
          >
            Most Votes
          </button>
          <button
            className={`filter-btn ${sort === 'active' ? 'active' : ''}`}
            onClick={() => handleSortChange('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${sort === 'unanswered' ? 'active' : ''}`}
            onClick={() => handleSortChange('unanswered')}
          >
            Unanswered
          </button>
        </div>

        {(search || tag) && (
          <div className="active-filters">
            {search && (
              <span className="active-filter">
                Search: "{search}"
                <button onClick={() => updateParams({ search: '' })}>×</button>
              </span>
            )}
            {tag && (
              <span className="active-filter">
                Tag: {tag}
                <button onClick={() => updateParams({ tag: '' })}>×</button>
              </span>
            )}
            <button className="clear-filters" onClick={handleClearFilters}>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="qa-content">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : questions.length === 0 ? (
          <div className="no-questions">
            <p>No questions found.</p>
            <button className="btn-primary" onClick={() => navigate('/qa/ask')}>
              Be the first to ask!
            </button>
          </div>
        ) : (
          <>
            <div className="questions-list">
              {questions.map(question => (
                <QuestionCard key={question._id} question={question} />
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionsListPage;
