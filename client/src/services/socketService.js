import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

console.log('🌐 Socket URL:', SOCKET_URL);

let socket = null;

export const initializeSocket = (token, userId, userName) => {
  console.log('🔌 initializeSocket called with:', { token: token ? 'YES' : 'NO', userId, userName });
  
  if (socket?.connected) {
    console.log('✅ Socket already connected:', socket.id);
    return socket;
  }

  console.log('⏳ Checking validation...');
  console.log('   - userId:', userId ? '✅' : '❌ MISSING');
  console.log('   - userName:', userName ? '✅' : '❌ MISSING');
  
  if (!userId || !userName) {
    console.error('❌ VALIDATION FAILED - Missing required socket params:', { userId, userName });
    return null;
  }

  console.log('🔌 Initializing socket connection to:', SOCKET_URL);
  
  // Socket.io options - token optional since cookies will be sent
  const socketOptions = {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    withCredentials: true, // Send cookies with request
  };

  // Add token to auth if available
  if (token) {
    socketOptions.auth = {
      token,
      userId,
      userName,
    };
    console.log('🔐 Auth params with token:', { userId, userName, hasToken: true });
  } else {
    // Token not required - cookies will be sent via withCredentials
    console.log('🔐 No token provided - will use cookies. userId:', userId, 'userName:', userName);
    socketOptions.auth = {
      userId,
      userName,
    };
  }
  
  socket = io(SOCKET_URL, socketOptions);

  socket.on('connect', () => {
    console.log('✅ Socket connected successfully! Socket ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message || error);
    console.error('❌ Full error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.warn('⚠️ Socket disconnected. Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error event:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('⚠️ Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

// Course messaging events
export const joinCourseRoom = (courseId) => {
  if (socket) {
    socket.emit('join-course', { courseId });
  }
};

export const leaveCourseRoom = (courseId) => {
  if (socket) {
    socket.emit('leave-course', { courseId });
  }
};

export const sendMessage = (courseId, message) => {
  if (!socket) {
    console.error('❌ Socket not initialized');
    return;
  }
  
  if (!socket.connected) {
    console.error('❌ Socket not connected');
    return;
  }
  
  console.log('📤 Emitting send-message:', { courseId, message });
  socket.emit('send-message', { courseId, message });
};

export const onReceiveMessage = (callback) => {
  if (socket) {
    socket.on('receive-message', callback);
  }
};

export const offReceiveMessage = () => {
  if (socket) {
    socket.off('receive-message');
  }
};

export const onUserJoined = (callback) => {
  if (socket) {
    socket.on('user-joined', callback);
  }
};

export const onUserLeft = (callback) => {
  if (socket) {
    socket.on('user-left', callback);
  }
};

export const onMessageError = (callback) => {
  if (socket) {
    socket.on('message-error', callback);
  }
};

export const userTyping = (courseId) => {
  if (socket) {
    socket.emit('user-typing', { courseId });
  }
};

export const userStopTyping = (courseId) => {
  if (socket) {
    socket.emit('user-stop-typing', { courseId });
  }
};

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user-typing', callback);
  }
};

export const onUserStopTyping = (callback) => {
  if (socket) {
    socket.on('user-stop-typing', callback);
  }
};
