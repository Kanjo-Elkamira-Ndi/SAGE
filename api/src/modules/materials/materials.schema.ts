import { z } from 'zod';
import { MAX_MATERIAL_BYTES } from '../../lib/storage';

export const createMaterialUploadUrlSchema = z.object({
  courseId: z.string().uuid('Invalid course'),
  fileName: z.string().trim().min(1, 'fileName is required').max(255),
  contentType: z.string().trim().min(1),
  fileSizeBytes: z.coerce.number().int().positive().max(MAX_MATERIAL_BYTES),
});

export const finalizeMaterialSchema = z.object({
  courseId: z.string().uuid('Invalid course'),
  title: z.string().trim().min(1, 'Title is required').max(200),
  storageKey: z.string().trim().min(3).max(500),
  contentType: z.string().trim().min(1),
  fileSizeBytes: z.coerce.number().int().positive().max(MAX_MATERIAL_BYTES),
});

export const newVersionMaterialSchema = z.object({
  courseId: z.string().uuid('Invalid course').optional(),
  title: z.string().trim().min(1).max(200).optional(),
  storageKey: z.string().trim().min(3).max(500),
  contentType: z.string().trim().min(1),
  fileSizeBytes: z.coerce.number().int().positive().max(MAX_MATERIAL_BYTES),
});

export type CreateMaterialUploadUrlInput = z.infer<typeof createMaterialUploadUrlSchema>;
export type FinalizeMaterialInput = z.infer<typeof finalizeMaterialSchema>;
export type NewVersionMaterialInput = z.infer<typeof newVersionMaterialSchema>;
