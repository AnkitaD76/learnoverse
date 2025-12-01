import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './db/connectDB.js';

// Error Handlers
import notFoundMiddleware from './middleware/not-found.js';
import { errorHandlerMiddleware } from './middleware/error-handler.js';

// Routers
import authRoutes from './routers/auth.routes.js';
import userRoutes from './routers/user.routes.js';
import postRoutes from './routers/post.routes.js';
import adminRoutes from './routers/admin.routes.js';
import courseRoutes from './routers/course.routes.js';

const app = express();

// CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGINS?.split(',') || [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
        ],
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

// API Routes (CORRECT ORDER)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/courses', courseRoutes);

// Error Handlers (MUST BE LAST)
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const start = async () => {
    try {
        await connectDB(MONGO_URI);
        app.listen(port, () =>
            console.log(`🚀 Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
};

start();
