import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(160),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Code must be at least 2 characters')
    .max(12)
    .regex(/^[A-Z0-9]+$/, 'Code must contain only letters and digits (e.g. CSC301)'),
  description: z.string().trim().max(2000).optional(),
  departmentId: z.string().uuid('Invalid department').optional(),
  creditUnits: z.coerce.number().int().min(1).max(6).optional(),
  semester: z.string().trim().max(30).optional(),
  outline: z.string().max(100_000).optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(12)
    .regex(/^[A-Z0-9]+$/, 'Code must contain only letters and digits (e.g. CSC301)')
    .optional(),
  description: z.string().trim().max(2000).optional(),
  departmentId: z.string().uuid('Invalid department').nullable().optional(),
  creditUnits: z.coerce.number().int().min(1).max(6).nullable().optional(),
  semester: z.string().trim().max(30).optional(),
  outline: z.string().max(100_000).nullable().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
