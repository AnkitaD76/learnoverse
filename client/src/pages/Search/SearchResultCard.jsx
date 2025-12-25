/**
 * Search Result Card Component
 * Displays a single search result in a card format
 * Adapts layout based on entity type
 */

import { Link } from 'react-router-dom';

export const SearchResultCard = ({ type, item, query }) => {
  const renderCard = () => {
    switch (type) {
      case 'courses':
        return <CourseCard item={item} query={query} />;
      case 'questions':
        return <QuestionCard item={item} query={query} />;
      case 'posts':
        return <PostCard item={item} query={query} />;
      case 'users':
        return <UserCard item={item} query={query} />;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {renderCard()}
    </div>
  );
};

/**
 * Course Card
 */
const CourseCard = ({ item }) => {
  return (
    <Link to={`/courses/${item._id}`} className="block">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-[#FF6A00]">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {item.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {item.instructor?.name}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {item.enrollCount} enrolled
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
              {item.level}
            </span>
          </div>
          {item.skillTags && item.skillTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.skillTags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#FF6A00]">
            {item.pricePoints}
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>
    </Link>
  );
};

/**
 * Question Card
 */
const QuestionCard = ({ item }) => {
  return (
    <Link to={`/qa/questions/${item._id}`} className="block">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 hover:text-[#FF6A00]">
          {item.title}
        </h3>
        {item.body && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {item.body.replace(/<[^>]*>/g, '')}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            {item.answerCount} {item.answerCount === 1 ? 'answer' : 'answers'}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            {item.voteScore} votes
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {item.viewCount} views
          </span>
          {item.acceptedAnswer && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              ✓ Accepted Answer
            </span>
          )}
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span
                key={tag._id}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
              >
                {tag.name || tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

/**
 * Post Card
 */
const PostCard = ({ item }) => {
  return (
    <div className="block">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          {item.user?.avatar ? (
            <img
              src={item.user.avatar}
              alt={item.user.name}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-medium text-white">
              {item.user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">
            {item.user?.name || 'Unknown User'}
          </div>
          <p className="mt-1 text-sm text-gray-700">{item.text}</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {item.likes?.length || 0} likes
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {item.comments?.length || 0} comments
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * User Card
 */
const UserCard = ({ item }) => {
  return (
    <Link to={`/profile/${item._id}`} className="block">
      <div className="flex items-center gap-4">
        {item.avatar ? (
          <img
            src={item.avatar}
            alt={item.name}
            className="h-16 w-16 rounded-full"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6A00] text-xl font-bold text-white">
            {item.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-[#FF6A00]">
            {item.name}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {item.role}
            </span>
            {item.institution && <span>• {item.institution}</span>}
          </div>
          {item.bio && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {item.bio}
            </p>
          )}
          {item.interests && item.interests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.interests.slice(0, 5).map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
