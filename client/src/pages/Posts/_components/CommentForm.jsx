import { useState } from 'react';
import { Button } from '../../../components/Button';

export const CommentForm = ({ onComment }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await onComment(text);

    if (result.success) {
      setText('');
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="rounded-lg bg-red-100 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex space-x-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          disabled={isLoading}
          required
        />
        <Button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="px-4 py-2 text-sm"
        >
          {isLoading ? 'Posting...' : 'Comment'}
        </Button>
      </div>
    </form>
  );
};
