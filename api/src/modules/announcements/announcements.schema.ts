import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(160),
  body: z.string().trim().min(1, 'Body is required').max(20_000),
  courseId: z.string().uuid('Invalid course').nullable().optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  body: z.string().trim().min(1).max(20_000).optional(),
  courseId: z.string().uuid('Invalid course').nullable().optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
