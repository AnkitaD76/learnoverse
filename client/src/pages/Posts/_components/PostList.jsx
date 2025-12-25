import { PostItem } from './PostItem';

export const PostList = ({
  posts,
  isAuthenticated,
  userId,
  onLike,
  onComment,
  onReport,
}) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
        No posts yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostItem
          key={post._id}
          post={post}
          isAuthenticated={isAuthenticated}
          userId={userId}
          onLike={onLike}
          onComment={onComment}
          onReport={onReport}
        />
      ))}
    </div>
  );
};
