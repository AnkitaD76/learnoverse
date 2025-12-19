export const CommentList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment, index) => (
        <div key={index} className="flex items-start space-x-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700">
            {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 rounded-lg bg-gray-100 px-3 py-2">
            <p className="text-sm font-semibold text-gray-800">
              {comment.user?.name || 'Unknown User'}
            </p>
            <p className="text-sm text-gray-700">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
