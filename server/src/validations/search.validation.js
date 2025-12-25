/**
 * Search Validation Schemas
 * Using Zod for type-safe request validation
 */

import { z } from 'zod';

/**
 * Common search parameters
 */
const baseSearchSchema = z.object({
    query: z.string().trim().optional().default(''),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

/**
 * Unified search validation
 */
export const unifiedSearchSchema = baseSearchSchema.extend({
    entities: z
        .string()
        .optional()
        .transform(val =>
            val
                ? val.split(',').map(e => e.trim())
                : ['courses', 'questions', 'posts', 'users', 'skillSwaps']
        )
        .refine(
            arr =>
                arr.every(e =>
                    [
                        'courses',
                        'questions',
                        'posts',
                        'users',
                        'skillSwaps',
                    ].includes(e)
                ),
            {
                message: 'Invalid entity type',
            }
        ),
});

/**
 * Course search validation
 */
export const courseSearchSchema = baseSearchSchema.extend({
    skills: z
        .string()
        .optional()
        .transform(val => (val ? val.split(',').map(s => s.trim()) : [])),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    instructor: z.string().optional(),
    sortBy: z
        .enum(['relevance', 'newest', 'popular', 'price'])
        .optional()
        .default('relevance'),
});

/**
 * Question search validation
 */
export const questionSearchSchema = baseSearchSchema.extend({
    tags: z
        .string()
        .optional()
        .transform(val => (val ? val.split(',').map(t => t.trim()) : [])),
    minVotes: z.coerce.number().optional(),
    hasAcceptedAnswer: z
        .string()
        .optional()
        .transform(val =>
            val === 'true' ? true : val === 'false' ? false : undefined
        ),
    sortBy: z
        .enum(['relevance', 'newest', 'votes', 'active'])
        .optional()
        .default('relevance'),
});

/**
 * Post search validation
 */
export const postSearchSchema = baseSearchSchema.extend({
    sortBy: z.enum(['newest', 'popular']).optional().default('newest'),
});

/**
 * User search validation
 */
export const userSearchSchema = baseSearchSchema.extend({
    role: z.enum(['student', 'instructor', 'admin', 'moderator']).optional(),
    country: z.string().optional(),
});

/**
 * Skill swap search validation
 */
export const skillSwapSearchSchema = baseSearchSchema.extend({
    status: z.enum(['pending', 'accepted', 'rejected']).optional(),
});
