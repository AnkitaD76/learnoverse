import React, { useState, useEffect, useContext } from 'react';
// import { SessionContext } from '../contexts/SessionContext';

const API_URL = 'http://localhost:3000/api/v1/posts';

function Posts() {
  // const { session } = useContext(SessionContext);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(setPosts);
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.token}`
      },
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      setText('');
    }
  };

  const handleLike = async (id) => {
    const res = await fetch(`${API_URL}/${id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session?.token}` }
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(posts.map(p => p._id === id ? updated : p));
    }
  };

  const handleComment = async (id) => {
    const res = await fetch(`${API_URL}/${id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.token}`
      },
      body: JSON.stringify({ text: commentText[id] })
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(posts.map(p => p._id === id ? updated : p));
      setCommentText({ ...commentText, [id]: '' });
    }
  };

  return (
    <div>
      <h2>Posts</h2>
      {session?.user && (
        <form onSubmit={handleCreatePost}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind?" required />
          <button type="submit">Post</button>
        </form>
      )}
      <ul>
        {posts.map(post => (
          <li key={post._id} style={{ border: '1px solid #ccc', margin: '1em 0', padding: '1em' }}>
            <div><b>{post.user?.name || 'Unknown'}</b>: {post.text}</div>
            <div>Likes: {post.likes.length} <button onClick={() => handleLike(post._id)}>Like</button></div>
            <div>
              <b>Comments:</b>
              <ul>
                {post.comments.map((c, i) => (
                  <li key={i}><b>{c.user?.name || 'Unknown'}:</b> {c.text}</li>
                ))}
              </ul>
              {session?.user && (
                <form onSubmit={e => { e.preventDefault(); handleComment(post._id); }}>
                  <input value={commentText[post._id] || ''} onChange={e => setCommentText({ ...commentText, [post._id]: e.target.value })} placeholder="Add a comment" required />
                  <button type="submit">Comment</button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Posts;
