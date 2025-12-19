import { useState } from 'react';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';

export const CreatePostForm = ({ onCreatePost }) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async e => {
        e.preventDefault();

        if (!text.trim()) {
            setError('Post text cannot be empty');
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await onCreatePost(text);

        if (result.success) {
            setText('');
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <Card className="mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Create a Post
                </h2>

                {error && (
                    <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        rows="4"
                        required
                        disabled={isLoading}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || !text.trim()}
                    className="w-full"
                >
                    {isLoading ? 'Posting...' : 'Post'}
                </Button>
            </form>
        </Card>
    );
};
