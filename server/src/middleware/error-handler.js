import { StatusCodes } from 'http-status-codes';

export const errorHandlerMiddleware = (err, req, res, next) => {
    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    const customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || 'Something went wrong, please try again later',
        success: false,
    };

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        customError.message = Object.values(err.errors)
            .map(item => item.message)
            .join(', ');
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    // Mongoose Duplicate Key Error
    if (err.code && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        customError.message = `The ${field} '${value}' is already in use. Please choose another value.`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    // Mongoose Cast Error (Invalid ObjectId)
    if (err.name === 'CastError') {
        customError.message = `Invalid ${err.path}: ${err.value}`;
        customError.statusCode = StatusCodes.NOT_FOUND;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        customError.message = 'Invalid token. Please login again.';
        customError.statusCode = StatusCodes.UNAUTHORIZED;
    }

    if (err.name === 'TokenExpiredError') {
        customError.message = 'Your token has expired. Please login again.';
        customError.statusCode = StatusCodes.UNAUTHORIZED;
    }

    // Send structured error response
    return res.status(customError.statusCode).json({
        success: false,
        message: customError.message,
        ...(process.env.NODE_ENV === 'development' && {
            error: err.message,
            stack: err.stack,
        }),
    });
};
