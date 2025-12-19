import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './db/connectDB.js';
import setupMessaging from './socket/messages.js';

// Error Handlers
import notFoundMiddleware from './middleware/not-found.js';
import { errorHandlerMiddleware } from './middleware/error-handler.js';

// Routers
import authRoutes from './routers/auth.routes.js';
import userRoutes from './routers/user.routes.js';
import postRoutes from './routers/post.routes.js';
import adminRoutes from './routers/admin.routes.js';
import courseRoutes from './routers/course.routes.js';
import dashboardRoutes from './routers/dashboard.routes.js';

// (Optional: only keep these if you really have these router files)
import notificationsRoutes from './routers/notifications.routes.js';
import skillSwapRoutes from './routers/skillSwap.routes.js';

const app = express();

// CORS
const allowedOrigins =
  process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) || [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

// Test route
app.get('/', (req, res) => {
  res.send('<h1>Learnoverse API</h1>');
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Optional modules (keep only if you created these endpoints)
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/skill-swap', skillSwapRoutes);

// Error Handlers (MUST BE LAST)
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const start = async () => {
  try {
    await connectDB(MONGO_URI);
    
    // Create HTTP server for Socket.io
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    // Setup messaging
    setupMessaging(io);

    httpServer.listen(port, () =>
      console.log(`🚀 Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};
start();
