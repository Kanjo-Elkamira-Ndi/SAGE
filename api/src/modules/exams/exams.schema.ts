import { z } from 'zod';

export const createExamSchema = z.object({
  courseId: z.string().uuid('Invalid course'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  scheduledAt: z.string().datetime({ offset: true }),
  durationMinutes: z.coerce.number().int().min(1).max(600).optional(),
  venue: z.string().trim().max(200).optional(),
  instructions: z.string().trim().max(5000).optional(),
});

export const updateExamSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
  durationMinutes: z.coerce.number().int().min(1).max(600).nullable().optional(),
  venue: z.string().trim().max(200).nullable().optional(),
  instructions: z.string().trim().max(5000).nullable().optional(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
