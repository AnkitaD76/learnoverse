import { z } from 'zod';

// Helper to validate rating (1-5 with 0.5 increments)
const ratingSchema = z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .refine(
        val => val % 0.5 === 0,
        'Rating must be in increments of 0.5 (e.g., 1, 1.5, 2, 2.5, etc.)'
    );

// Create review schema
export const createReviewSchema = z.object({
    body: z.object({
        courseId: z.string().min(1, 'Course ID is required'),
        courseRating: ratingSchema,
        instructorRating: ratingSchema,
        reviewText: z
            .string()
            .max(2000, 'Review text cannot exceed 2000 characters')
            .optional()
            .default(''),
    }),
});

// Update review schema
export const updateReviewSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
    body: z.object({
        courseRating: ratingSchema.optional(),
        instructorRating: ratingSchema.optional(),
        reviewText: z
            .string()
            .max(2000, 'Review text cannot exceed 2000 characters')
            .optional(),
    }),
});

// Get reviews for course schema
export const getCourseReviewsSchema = z.object({
    params: z.object({
        courseId: z.string().min(1, 'Course ID is required'),
    }),
    query: z.object({
        page: z
            .string()
            .optional()
            .default('1')
            .transform(val => parseInt(val, 10))
            .refine(val => val > 0, 'Page must be greater than 0'),
        limit: z
            .string()
            .optional()
            .default('10')
            .transform(val => parseInt(val, 10))
            .refine(
                val => val > 0 && val <= 50,
                'Limit must be between 1 and 50'
            ),
        sortBy: z
            .enum(['newest', 'oldest', 'highest', 'lowest', 'helpful'])
            .optional()
            .default('newest'),
    }),
});

// Mark review as helpful/not helpful
export const markReviewHelpfulSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
    body: z.object({
        helpful: z.boolean(),
    }),
});

// Get user's review for course
export const getUserReviewSchema = z.object({
    params: z.object({
        courseId: z.string().min(1, 'Course ID is required'),
    }),
});

// Delete review (admin)
export const deleteReviewSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
});
