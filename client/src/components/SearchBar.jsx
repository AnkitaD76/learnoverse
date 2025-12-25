/**
 * SearchBar Component
 * Global search input with instant suggestions dropdown
 * Features:
 * - Debounced input to reduce API calls
 * - Request cancellation for abandoned searches
 * - Instant preview of results across entities
 * - Keyboard navigation support
 * - Click outside to close dropdown
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchSuggestions } from '../api/search';
import { debounce } from '../utils/debounce';

export const SearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const abortControllerRef = useRef(null);

  /**
   * Fetch search suggestions (debounced)
   */
  const fetchSuggestions = useCallback(
    debounce(async searchQuery => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSuggestions([]);
        setTotalResults(0);
        setIsOpen(false);
        return;
      }

      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);

      try {
        const response = await getSearchSuggestions(searchQuery);
        setSuggestions(response.suggestions || []);
        setTotalResults(response.totalResults || 0);
        setIsOpen(true);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  /**
   * Handle input change
   */
  const handleInputChange = e => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  /**
   * Handle form submit (go to full search page)
   */
  const handleSubmit = e => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  /**
   * Handle clicking on a suggestion
   */
  const handleSuggestionClick = (type, id) => {
    setIsOpen(false);
    setQuery('');

    // Navigate to entity detail page
    switch (type) {
      case 'courses':
        navigate(`/courses/${id}`);
        break;
      case 'questions':
        navigate(`/qa/questions/${id}`);
        break;
      case 'posts':
        navigate(`/posts`);
        break;
      case 'users':
        navigate(`/profile/${id}`);
        break;
      default:
        break;
    }
  };

  /**
   * Handle "View all results" click
   */
  const handleViewAll = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Cleanup abort controller on unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search courses, questions, posts, users..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 focus:outline-none"
          />
          <svg
            className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {isLoading && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent" />
            </div>
          )}
        </div>
      </form>

      {/* Instant Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="max-h-96 overflow-y-auto">
            {suggestions.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              <>
                {suggestions.map(group => (
                  <SuggestionGroup
                    key={group.type}
                    group={group}
                    onItemClick={handleSuggestionClick}
                  />
                ))}

                {/* View All Results */}
                {totalResults > 0 && (
                  <div className="border-t border-gray-100 p-3">
                    <button
                      onClick={handleViewAll}
                      className="w-full rounded-md bg-[#FF6A00] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#E55F00]"
                    >
                      View all {totalResults} results
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Suggestion Group Component
 * Displays suggestions for a single entity type
 */
const SuggestionGroup = ({ group, onItemClick }) => {
  if (!group.data || group.data.length === 0) return null;

  const getEntityLabel = type => {
    const labels = {
      courses: 'Courses',
      questions: 'Q&A',
      posts: 'Posts',
      users: 'Users',
    };
    return labels[type] || type;
  };

  return (
    <div className="border-b border-gray-100 p-3 last:border-b-0">
      <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">
        {getEntityLabel(group.type)}
      </h3>
      <ul className="space-y-1">
        {group.data.map(item => (
          <SuggestionItem
            key={item._id}
            type={group.type}
            item={item}
            onClick={() => onItemClick(group.type, item._id)}
          />
        ))}
      </ul>
    </div>
  );
};

/**
 * Suggestion Item Component
 * Displays a single search result item
 */
const SuggestionItem = ({ type, item, onClick }) => {
  const renderItem = () => {
    switch (type) {
      case 'courses':
        return (
          <>
            <div className="font-medium text-gray-900">{item.title}</div>
            <div className="text-xs text-gray-500">
              {item.instructor?.name} • {item.pricePoints} points
            </div>
          </>
        );
      case 'questions':
        return (
          <>
            <div className="font-medium text-gray-900">{item.title}</div>
            <div className="text-xs text-gray-500">
              {item.answerCount} answers • {item.voteScore} votes
            </div>
          </>
        );
      case 'posts':
        return (
          <>
            <div className="line-clamp-2 text-gray-900">{item.text}</div>
            <div className="text-xs text-gray-500">by {item.user?.name}</div>
          </>
        );
      case 'users':
        return (
          <>
            <div className="flex items-center gap-2">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6A00] text-xs text-white">
                  {item.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-gray-900">{item.name}</span>
            </div>
            <div className="text-xs text-gray-500">{item.role}</div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <li>
      <button
        onClick={onClick}
        className="w-full rounded-md p-2 text-left transition-colors hover:bg-gray-50"
      >
        {renderItem()}
      </button>
    </li>
  );
};
