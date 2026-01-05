/**
 * Search Results Page
 * Full-page search interface with:
 * - Category tabs (All, Courses, Q&A, Posts, Users)
 * - Advanced filters (course-specific)
 * - Pagination
 * - Sort options
 * - URL query param sync
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  unifiedSearch,
  searchCourses,
  searchQuestions,
  searchPosts,
  searchUsers,
} from '../../api/search';
import { SearchFilters } from './SearchFilters';
import { SearchResultCard } from './SearchResultCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const ENTITY_TABS = [
  {
    id: 'all',
    label: 'All',
    entities: ['courses', 'questions', 'posts', 'users'],
  },
  { id: 'courses', label: 'Courses', entities: ['courses'] },
  { id: 'questions', label: 'Q&A', entities: ['questions'] },
  { id: 'posts', label: 'Posts', entities: ['posts'] },
  { id: 'users', label: 'Users', entities: ['users'] },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [pagination, setPagination] = useState({});

  // Get query from URL
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  // Filters state
  const [filters, setFilters] = useState({
    skills: [],
    priceMin: undefined,
    priceMax: undefined,
    level: undefined,
    sortBy: 'relevance',
  });

  /**
   * Perform search based on active tab and filters
   */
  const performSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response;

      if (activeTab === 'all') {
        response = await unifiedSearch(
          query,
          {
            entities: ENTITY_TABS.find(t => t.id === 'all').entities,
          },
          { page, limit: 10 }
        );

        setResults(response.results || []);
        setTotalResults(response.totalResults || 0);
      } else if (activeTab === 'courses') {
        response = await searchCourses(query, filters, {
          page,
          limit: 10,
          sortBy: filters.sortBy,
        });
        setResults([{ type: 'courses', ...response }]);
        setTotalResults(response.pagination?.total || 0);
        setPagination(response.pagination || {});
      } else if (activeTab === 'questions') {
        response = await searchQuestions(
          query,
          {},
          { page, limit: 10, sortBy: filters.sortBy }
        );
        setResults([{ type: 'questions', ...response }]);
        setTotalResults(response.pagination?.total || 0);
        setPagination(response.pagination || {});
      } else if (activeTab === 'posts') {
        // Posts only support 'newest' and 'popular', not 'relevance'
        const postSortBy =
          filters.sortBy === 'relevance' ? 'newest' : filters.sortBy;
        response = await searchPosts(query, {
          page,
          limit: 10,
          sortBy: postSortBy,
        });
        setResults([{ type: 'posts', ...response }]);
        setTotalResults(response.pagination?.total || 0);
        setPagination(response.pagination || {});
      } else if (activeTab === 'users') {
        response = await searchUsers(query, {}, { page, limit: 10 });
        setResults([{ type: 'users', ...response }]);
        setTotalResults(response.pagination?.total || 0);
        setPagination(response.pagination || {});
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch search results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect: Trigger search when query, tab, filters, or page changes
   */
  useEffect(() => {
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTab, page, filters]);

  /**
   * Handle tab change
   */
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    setSearchParams({ q: query, page: '1' }); // Reset to page 1
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = newFilters => {
    setFilters(newFilters);
    setSearchParams({ q: query, page: '1' }); // Reset to page 1
  };

  /**
   * Handle page change
   */
  const handlePageChange = newPage => {
    setSearchParams({ q: query, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Query Display */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Search Results
            {query && (
              <span className="ml-2 text-gray-600">
                for &quot;{query}&quot;
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {ENTITY_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#FF6A00] text-[#FF6A00]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar (only for courses) */}
          {activeTab === 'courses' && (
            <aside className="w-64 shrink-0">
              <SearchFilters filters={filters} onChange={handleFilterChange} />
            </aside>
          )}

          {/* Results */}
          <main className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
            ) : !query ? (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">
                  Enter a search query to see results
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">
                  No results found for &quot;{query}&quot;
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <>
                {/* Results by Category */}
                {activeTab === 'all' ? (
                  <div className="space-y-8">
                    {results.map(group => (
                      <ResultGroup
                        key={group.type}
                        group={group}
                        query={query}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results[0]?.data?.map(item => (
                      <SearchResultCard
                        key={item._id}
                        type={results[0].type}
                        item={item}
                        query={query}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {activeTab !== 'all' && pagination.pages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={pagination.pages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Result Group Component
 * Displays results for one entity type in "All" view
 */
const ResultGroup = ({ group, query }) => {
  if (!group.data || group.data.length === 0) return null;

  const getEntityLabel = type => {
    const labels = {
      courses: 'Courses',
      questions: 'Q&A Questions',
      posts: 'Posts',
      users: 'Users',
    };
    return labels[type] || type;
  };

  const getViewAllLink = type => {
    const links = {
      courses: '/courses',
      questions: '/qa',
      posts: '/posts',
      users: '/users',
    };
    return links[type] || '/';
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {getEntityLabel(group.type)}
        </h2>
        {group.pagination?.total > group.data.length && (
          <Link
            to={`${getViewAllLink(group.type)}?q=${encodeURIComponent(query)}`}
            className="text-sm text-[#FF6A00] hover:text-[#E55F00]"
          >
            View all {group.pagination.total} →
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {group.data.map(item => (
          <SearchResultCard
            key={item._id}
            type={group.type}
            item={item}
            query={query}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Pagination Component
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            page === currentPage
              ? 'bg-[#FF6A00] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};
