/**
 * Socket.io Message Handler
 * Handles real-time messaging in courses
 * Messages are NOT stored in DB - only in memory during connection
 */

export const setupMessaging = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const auth = socket.handshake.auth;
    const token = auth.token;
    const userId = auth.userId;
    const userName = auth.userName;
    
    console.log('🔐 Socket auth attempt:', { hasToken: !!token, userId, userName });
    
    // Token is optional - cookies might be sent instead
    // But userId and userName are required
    if (!userId || !userName) {
      console.error('❌ Socket auth failed - missing userId or userName:', { userId, userName });
      return next(new Error('Authentication failed: userId and userName required'));
    }
    
    // Store user info in socket
    socket.userId = userId;
    socket.userName = userName;
    
    console.log('✅ Socket auth passed for:', { userId, userName });
    next();
  });

  // Main connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userName} (${socket.userId}) connected`);

    /**
     * Join a course room
     * Event: 'join-course'
     * Data: { courseId }
     */
    socket.on('join-course', (data) => {
      const { courseId } = data;
      const room = `course-${courseId}`;
      
      console.log(`🚪 join-course event received from ${socket.userName}:`, { courseId, socketId: socket.id });
      socket.join(room);
      console.log(`✅ ${socket.userName} (${socket.id}) joined room: ${room}`);
      console.log(`📊 Room members:`, [...socket.adapter.rooms.get(room) || []].length);
      
      // Notify others that user joined
      socket.to(room).emit('user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date(),
      });
    });

    /**
     * Send message in course
     * Event: 'send-message'
     * Data: { courseId, message }
     */
    socket.on('send-message', (data) => {
      console.log('📬 send-message event received:', { data, socketId: socket.id });
      const { courseId, message } = data;
      const room = `course-${courseId}`;
      
      console.log(`📍 Room: ${room}, Message length: ${message?.length}, Message: ${message?.substring(0, 50)}`);
      
      // Validate message
      if (!message || message.trim().length === 0) {
        console.log('❌ Empty message, sending error');
        socket.emit('message-error', { error: 'Message cannot be empty' });
        return;
      }

      if (message.length > 500) {
        console.log('❌ Message too long:', message.length);
        socket.emit('message-error', { error: 'Message too long (max 500 chars)' });
        return;
      }

      // Create message object (not stored, only sent)
      const messageObj = {
        id: `${socket.userId}-${Date.now()}`, // Temporary ID
        userId: socket.userId,
        userName: socket.userName,
        message: message.trim(),
        timestamp: new Date(),
      };

      console.log(`💬 Message in ${room} from ${socket.userName}: ${message}`);
      console.log(`📤 Broadcasting to room ${room}:`, messageObj);
      
      // Emit to all users in room (including sender)
      io.to(room).emit('receive-message', messageObj);
      console.log(`✅ Message broadcasted to ${room}`);
    });

    /**
     * User is typing
     * Event: 'user-typing'
     * Data: { courseId }
     */
    socket.on('user-typing', (data) => {
      const { courseId } = data;
      const room = `course-${courseId}`;
      
      socket.to(room).emit('user-typing', {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    /**
     * User stopped typing
     * Event: 'user-stop-typing'
     * Data: { courseId }
     */
    socket.on('user-stop-typing', (data) => {
      const { courseId } = data;
      const room = `course-${courseId}`;
      
      socket.to(room).emit('user-stop-typing', {
        userId: socket.userId,
      });
    });

    /**
     * Leave course room
     * Event: 'leave-course'
     * Data: { courseId }
     */
    socket.on('leave-course', (data) => {
      const { courseId } = data;
      const room = `course-${courseId}`;
      
      socket.leave(room);
      console.log(`👋 ${socket.userName} left room: ${room}`);
      
      // Notify others that user left
      socket.to(room).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date(),
      });
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.userName} (${socket.userId}) disconnected`);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

export default setupMessaging;
