/**
 * Report Validation Schemas
 * Using Zod for type-safe request validation
 */

import { z } from 'zod';

/**
 * Create report validation
 */
export const createReportSchema = z.object({
    reportType: z.enum(['course', 'post', 'user', 'liveSession'], {
        required_error: 'Report type is required',
        invalid_type_error: 'Invalid report type',
    }),
    reportedEntity: z.string().regex(/^[0-9a-fA-F]{24}$/, {
        message: 'Invalid entity ID',
    }),
    reportedUser: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, {
            message: 'Invalid user ID',
        })
        .optional()
        .nullable(),
    category: z.enum(
        [
            'inappropriate-content',
            'spam',
            'harassment',
            'scam',
            'copyright',
            'other',
        ],
        {
            required_error: 'Category is required',
            invalid_type_error: 'Invalid category',
        }
    ),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must not exceed 1000 characters')
        .trim(),
});

/**
 * Update report status validation (Admin)
 */
export const updateReportSchema = z.object({
    status: z
        .enum(['pending', 'reviewed', 'dismissed', 'action-taken'])
        .optional(),
    adminAction: z
        .enum(['none', 'dismissed', 'content-deleted', 'user-banned'])
        .optional(),
    adminNotes: z.string().max(500).trim().optional(),
});

/**
 * Get reports query validation
 */
export const getReportsSchema = z.object({
    status: z
        .string()
        .transform(val => (val === '' ? undefined : val))
        .pipe(
            z
                .enum(['pending', 'reviewed', 'dismissed', 'action-taken'])
                .optional()
        ),
    reportType: z
        .string()
        .transform(val => (val === '' ? undefined : val))
        .pipe(z.enum(['course', 'post', 'user', 'liveSession']).optional()),
    category: z
        .string()
        .transform(val => (val === '' ? undefined : val))
        .pipe(
            z
                .enum([
                    'inappropriate-content',
                    'spam',
                    'harassment',
                    'scam',
                    'copyright',
                    'other',
                ])
                .optional()
        ),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Get user's own reports validation
 */
export const getUserReportsSchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

/**
 * Mark spam reporter validation
 */
export const markSpamReporterSchema = z.object({
    reporterId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
        message: 'Invalid reporter ID',
    }),
});
