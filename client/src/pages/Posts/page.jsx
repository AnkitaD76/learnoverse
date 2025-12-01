import { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import apiClient from '../../api/client';
import { CreatePostForm } from './_components/CreatePostForm';
import { PostList } from './_components/PostList';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const PostsPage = () => {
  const { user, isAuthenticated } = useSession();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = user?._id || user?.userId;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/posts');
      setPosts(response.data.posts || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async text => {
    try {
      const response = await apiClient.post('/posts', { text });
      const newPost = response.data.post || response.data;
      setPosts([newPost, ...posts]);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create post',
      };
    }
  };

  const handleLike = async postId => {
    try {
      const response = await apiClient.post(`/posts/${postId}/like`);
      const updatedPost = response.data.post || response.data;
      setPosts(posts.map(p => (p._id === postId ? updatedPost : p)));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to like post',
      };
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const response = await apiClient.post(`/posts/${postId}/comment`, {
        text,
      });
      const updatedPost = response.data.post || response.data;
      setPosts(posts.map(p => (p._id === postId ? updatedPost : p)));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to add comment',
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Posts</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {isAuthenticated && <CreatePostForm onCreatePost={handleCreatePost} />}

        <PostList
          posts={posts}
          isAuthenticated={isAuthenticated}
          userId={userId}
          onLike={handleLike}
          onComment={handleComment}
        />
      </div>
    </div>
  );
};

export default PostsPage;
