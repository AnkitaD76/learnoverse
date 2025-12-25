/**
 * Wraps async route handlers to catch errors and pass them to error middleware
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function that catches errors
 */
export const asyncWrapper = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
