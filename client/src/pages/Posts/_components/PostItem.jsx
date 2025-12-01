import { useState } from 'react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

export const PostItem = ({
  post,
  isAuthenticated,
  userId,
  onLike,
  onComment,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Check if current user has liked this post
  const isLiked =
    userId &&
    post.likes?.some(
      like => (typeof like === 'string' ? like : like._id || like) === userId
    );

  const handleLike = async () => {
    setIsLiking(true);
    await onLike(post._id);
    setIsLiking(false);
  };

  const handleComment = async text => {
    const result = await onComment(post._id, text);
    return result;
  };

  return (
    <Card className="space-y-4">
      {/* Post Header */}
      <div className="flex items-start space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-semibold text-white">
          {post.user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">
            {post.user?.name || 'Unknown User'}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-700">{post.text}</p>

      {/* Post Actions */}
      <div className="flex items-center space-x-4 border-t border-gray-200 pt-3">
        <button
          onClick={handleLike}
          disabled={!isAuthenticated || isLiking}
          className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isAuthenticated
              ? isLiked
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
              : 'cursor-not-allowed text-gray-400'
          }`}
        >
          <span>{isLiked ? '👍' : '👍'}</span>
          <span>
            {post.likes?.length || 0}{' '}
            {post.likes?.length === 1 ? 'Like' : 'Likes'}
          </span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <span>💬</span>
          <span>
            {post.comments?.length || 0}{' '}
            {post.comments?.length === 1 ? 'Comment' : 'Comments'}
          </span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <CommentList comments={post.comments || []} />

          {isAuthenticated && <CommentForm onComment={handleComment} />}
        </div>
      )}
    </Card>
  );
};
