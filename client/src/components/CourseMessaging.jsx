import { useState, useEffect, useRef } from 'react';
import {
  joinCourseRoom,
  leaveCourseRoom,
  sendMessage,
  onReceiveMessage,
  offReceiveMessage,
  onUserJoined,
  onUserLeft,
  onMessageError,
  userTyping,
  userStopTyping,
  onUserTyping,
  onUserStopTyping,
  getSocket,
} from '../services/socketService.js';

const CourseMessaging = ({ courseId, currentUserId, currentUserName }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Monitor socket connection status
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const socket = getSocket();
      const isConnected = socket?.connected || false;
      setSocketConnected(isConnected);
      console.log('🔌 Socket connected:', isConnected);
    }, 1000);

    return () => clearInterval(checkConnection);
  }, []);

  // Join room on mount
  useEffect(() => {
    console.log('📱 Attempting to join course room:', courseId);

    // Add a small delay to ensure socket is ready
    const timer = setTimeout(() => {
      const socket = getSocket();
      console.log('🔌 Socket status before join:', socket?.connected);
      joinCourseRoom(courseId);
      console.log('✅ Joined course room:', courseId);
    }, 500);

    return () => {
      clearTimeout(timer);
      leaveCourseRoom(courseId);
      offReceiveMessage();
    };
  }, [courseId]);

  // Listen for messages
  useEffect(() => {
    const handleReceiveMessage = messageObj => {
      setMessages(prev => [...prev, messageObj]);
      scrollToBottom();
    };

    onReceiveMessage(handleReceiveMessage);

    return () => {
      offReceiveMessage();
    };
  }, []);

  // Listen for user events
  useEffect(() => {
    onUserJoined(data => {
      console.log(`${data.userName} joined the chat`);
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          message: `${data.userName} joined the chat`,
          timestamp: data.timestamp,
        },
      ]);
      scrollToBottom();
    });

    onUserLeft(data => {
      console.log(`${data.userName} left the chat`);
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          message: `${data.userName} left the chat`,
          timestamp: data.timestamp,
        },
      ]);
      scrollToBottom();
    });

    onMessageError(data => {
      setError(data.error);
      setTimeout(() => setError(null), 3000);
    });
  }, []);

  // Listen for typing indicators
  useEffect(() => {
    onUserTyping(data => {
      setTypingUsers(prev => new Set([...prev, data.userId]));
    });

    onUserStopTyping(data => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      userTyping(courseId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      userStopTyping(courseId);
    }, 2000);
  };

  const handleSendMessage = e => {
    e.preventDefault();
    console.log('📤 Send message clicked');

    if (!messageInput.trim()) {
      console.log('⚠️ Message is empty');
      setError('Message cannot be empty');
      setTimeout(() => setError(null), 3000);
      return;
    }

    console.log('💬 Sending message:', messageInput);
    setIsLoading(true);

    // Send to server - don't add optimistic update, server will broadcast it back
    sendMessage(courseId, messageInput);
    console.log('✅ Message sent to server');

    setMessageInput('');
    setIsLoading(false);
    setIsTyping(false);
    userStopTyping(courseId);
    scrollToBottom();
  };

  return (
    <div className="flex h-[600px] flex-col rounded-lg border border-[#E5E5E5] bg-white">
      {/* Header */}
      <div className="border-b border-[#E5E5E5] bg-gradient-to-r from-[#FF6A00]/5 to-[#FF6A00]/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">Course Chat</h3>
            <p className="text-xs text-[#4A4A4A]">
              Real-time messaging with students
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-xs font-medium text-[#4A4A4A]">
              {socketConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#FAFAFA] p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[#4A4A4A]">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.userId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'system' ? (
                  <div className="flex w-full items-center justify-center">
                    <p className="rounded-full bg-gray-100 px-3 py-1 text-xs text-[#999999] italic">
                      {msg.message}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`max-w-xs ${
                      msg.userId === currentUserId
                        ? 'rounded-lg rounded-tr-none bg-[#FF6A00] text-white'
                        : 'rounded-lg rounded-tl-none border border-[#E5E5E5] bg-white text-[#1A1A1A]'
                    } px-4 py-2 break-words`}
                  >
                    {msg.userId !== currentUserId && (
                      <p className="mb-1 text-xs font-semibold opacity-75">
                        {msg.userName}
                      </p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`mt-1 text-xs ${
                        msg.userId === currentUserId
                          ? 'text-white/70'
                          : 'text-[#4A4A4A]'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#FF6A00]" />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-[#FF6A00]"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-[#FF6A00]"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
                <p className="text-xs text-[#4A4A4A] italic">
                  {Array.from(typingUsers).length} user
                  {typingUsers.size !== 1 ? 's' : ''} typing...
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-[#E5E5E5] bg-white p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={e => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            onBlur={() => {
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              setIsTyping(false);
              userStopTyping(courseId);
            }}
            placeholder="Type a message..."
            maxLength="500"
            className="flex-1 rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm focus:border-[#FF6A00] focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !messageInput.trim()}
            className="rounded-lg bg-[#FF6A00] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        <p className="mt-2 text-xs text-[#4A4A4A]">
          {messageInput.length}/500 characters
        </p>
      </form>
    </div>
  );
};

export default CourseMessaging;
