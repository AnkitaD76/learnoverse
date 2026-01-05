import { BadRequestError } from '../errors/index.js';

/**
 * Middleware to validate request using Zod schemas
 * @param {ZodSchema} schema - Zod validation schema
 * @param {string} source - Source of data to validate: 'body', 'query', or 'params'
 */
export const validateRequest = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            // Check if schema has nested body, query, or params properties
            const schemaShape = schema._def?.shape || schema.shape;

            if (
                schemaShape &&
                (schemaShape.body || schemaShape.query || schemaShape.params)
            ) {
                // Schema has multiple parts (body, query, params)
                const dataToValidate = {
                    body: req.body,
                    query: req.query,
                    params: req.params,
                };

                const validated = await schema.parseAsync(dataToValidate);

                // Update request with validated data
                if (validated.body) req.body = validated.body;
                if (validated.query) {
                    Object.keys(validated.query).forEach(key => {
                        req.query[key] = validated.query[key];
                    });
                }
                if (validated.params) {
                    Object.keys(validated.params).forEach(key => {
                        req.params[key] = validated.params[key];
                    });
                }
            } else {
                // Single source validation based on source parameter
                const dataToValidate = req[source] || {};
                const validated = await schema.parseAsync(dataToValidate);

                // Update validated data back to request
                if (source === 'body') {
                    req.body = validated;
                } else {
                    // For query and params, update individual keys
                    Object.keys(validated).forEach(key => {
                        req[source][key] = validated[key];
                    });
                }
            }

            next();
        } catch (error) {
            if (error.errors) {
                // Zod validation error
                throw new BadRequestError(JSON.stringify(error.errors));
            }
            throw error;
        }
    };
};
