import { BadRequestError } from '../errors/index.js';

/**
 * Middleware to validate request using Zod schemas
 * @param {ZodSchema} schema - Zod validation schema
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 */
export const validateRequest = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const dataToValidate = req[source];
            const validated = await schema.parseAsync(dataToValidate);

            // For query and params, we need to handle them specially as they're read-only
            if (source === 'query' || source === 'params') {
                // Store validated data in a separate property
                req.validated = req.validated || {};
                req.validated[source] = validated;
                // Also merge back into the original for compatibility
                Object.keys(validated).forEach(key => {
                    req[source][key] = validated[key];
                });
            } else {
                req[source] = validated;
            }

            next();
        } catch (error) {
            if (error.errors) {
                // Zod validation error
                const errorMessages = error.errors
                    .map(err => `${err.path.join('.')}: ${err.message}`)
                    .join(', ');
                throw new BadRequestError(errorMessages);
            }
            throw error;
        }
    };
};
