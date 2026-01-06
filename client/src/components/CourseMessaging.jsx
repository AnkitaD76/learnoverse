import { useState, useEffect, useRef } from 'react';
import {
  initializeSocket,
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
import { uploadTempImage, getTempImageUrl } from '../api/tempImage.js';
import { getAccessToken } from '../api/client.js';

const CourseMessaging = ({ courseId, currentUserId, currentUserName }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const imageInputRef = useRef(null);

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

  // Initialize socket connection on mount
  useEffect(() => {
    console.log('💬 CourseMessaging component mounted');
    console.log('👤 Props:', { courseId, currentUserId, currentUserName });

    if (!currentUserId || !currentUserName) {
      console.warn('⚠️ Missing user info for socket init');
      return;
    }

    // Initialize socket if not already done
    const socket = getSocket();
    if (!socket?.connected) {
      console.log('🔌 Socket not ready, initializing...');
      const token = getAccessToken();
      const initResult = initializeSocket(token, currentUserId, currentUserName);
      console.log('✅ Socket initialization result:', initResult);
    } else {
      console.log('✅ Socket already initialized');
    }
  }, [currentUserId, currentUserName]);

  // Join room on mount
  useEffect(() => {
    console.log('📱 Attempting to join course room:', courseId);

    // Wait for socket to be connected, then join room
    const attemptJoin = setInterval(() => {
      const socket = getSocket();
      if (socket?.connected) {
        console.log('✅ Socket ready, joining room...');
        joinCourseRoom(courseId);
        console.log('✅ Joined course room:', courseId);
        clearInterval(attemptJoin);
      } else {
        console.log('⏳ Waiting for socket connection... current:', socket?.connected);
      }
    }, 100); // Check every 100ms

    // Safety timeout - give up after 5 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(attemptJoin);
      console.warn('⚠️ Socket did not connect within 5 seconds');
    }, 5000);

    return () => {
      clearInterval(attemptJoin);
      clearTimeout(timeoutId);
      leaveCourseRoom(courseId);
      offReceiveMessage();
    };
  }, [courseId]);

  // Listen for messages
  useEffect(() => {
    const handleReceiveMessage = messageObj => {
      console.log('📨 Message received from server:', messageObj);
      console.log('   Message content:', messageObj.message);
      setMessages(prev => {
        console.log('📊 Current messages count:', prev.length);
        const updated = [...prev, messageObj];
        console.log('📊 Updated messages count:', updated.length);
        return updated;
      });
      scrollToBottom();
    };

    console.log('🎧 Setting up receive-message listener');
    onReceiveMessage(handleReceiveMessage);

    return () => {
      console.log('🎧 Cleaning up receive-message listener');
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
    console.log('Message:', messageInput);
    console.log('isLoading:', isLoading);
    console.log('isUploadingImage:', isUploadingImage);
    console.log('Socket connected:', socketConnected);

    if (!messageInput.trim()) {
      console.log('⚠️ Message is empty');
      setError('Message cannot be empty');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!socketConnected) {
      console.log('❌ Socket not connected');
      setError('Not connected to chat. Please refresh.');
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

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is image
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setIsUploadingImage(true);
      setError(null);

      console.log('📸 Uploading image:', { name: file.name, size: file.size, type: file.type });

      // Upload image to temporary storage
      const response = await uploadTempImage(file);
      console.log('🖼️ Image uploaded response:', response);

      if (!response.imageId) {
        throw new Error('No imageId returned from server');
      }

      // Send image message
      const imageMessage = `[IMAGE:${response.imageId}]`;
      sendMessage(courseId, imageMessage);
      console.log('✅ Image message sent');

      // Reset file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to upload image';
      setError(errorMsg);
      console.error('Image upload error:', {
        message: errorMsg,
        status: err.response?.status,
        data: err.response?.data,
        fullError: err
      });
    } finally {
      setIsUploadingImage(false);
    }
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
            {messages.map(msg => {
              // Check if message is an image
              const isImageMessage = msg.message?.startsWith('[IMAGE:');
              const imageMatch = msg.message?.match(/\[IMAGE:([^\]]+)\]/);
              const imageId = imageMatch?.[1];
              // Construct image URL from imageId
              const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
              const imageUrl = imageId ? `${baseURL}/temp-images/${imageId}` : null;

              if (msg.message?.includes('IMAGE')) {
                console.log('🖼️ IMAGE MESSAGE FOUND:');
                console.log('  messageContent:', msg.message);
                console.log('  isImageMessage:', isImageMessage);
                console.log('  imageId:', imageId);
                console.log('  imageUrl:', imageUrl);
              }

              return (
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
                  ) : isImageMessage && imageId ? (
                    // Image message
                    <div
                      className={`flex flex-col gap-1 ${
                        msg.userId === currentUserId ? 'items-end' : 'items-start'
                      }`}
                    >
                      {msg.userId !== currentUserId && (
                        <p className="px-2 text-xs font-semibold text-[#4A4A4A]">
                          {msg.userName}
                        </p>
                      )}
                      <div
                        className={`overflow-hidden rounded-lg ${
                          msg.userId === currentUserId
                            ? 'rounded-tr-none'
                            : 'rounded-tl-none'
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt="shared"
                          className="max-h-64 max-w-xs object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage Expired%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <p
                        className={`px-2 text-xs ${
                          msg.userId === currentUserId
                            ? 'text-[#4A4A4A]'
                            : 'text-[#4A4A4A]'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ) : (
                    // Text message
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
              );
            })}

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
            disabled={isLoading || isUploadingImage}
          />

          {/* Image Upload Button */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="imageUpload"
            disabled={isUploadingImage}
          />
          <label
            htmlFor="imageUpload"
            className={`flex items-center justify-center rounded-lg px-3 py-2 text-xl transition ${
              isUploadingImage
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:bg-gray-100'
            }`}
            title="Upload image"
          >
            🖼️
          </label>

          <button
            type="submit"
            disabled={isLoading || !messageInput.trim() || isUploadingImage}
            className="rounded-lg bg-[#FF6A00] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        <p className="mt-2 text-xs text-[#4A4A4A]">
          {messageInput.length}/500 characters
          {isUploadingImage && ' • 📤 Uploading image...'}
        </p>
      </form>
    </div>
  );
};

export default CourseMessaging;
