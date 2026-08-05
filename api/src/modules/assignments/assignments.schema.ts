import { z } from 'zod';
import { MAX_SUBMISSION_BYTES } from '../../lib/storage';

export const createAssignmentSchema = z.object({
  courseId: z.string().uuid('Invalid course'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  instructions: z.string().trim().max(10_000).optional(),
  maxScore: z.coerce.number().positive().max(1000).default(100),
  deadlineAt: z.string().datetime({ offset: true }),
  allowLateSubmission: z.boolean().default(false),
});

export const updateAssignmentSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  instructions: z.string().trim().max(10_000).nullable().optional(),
  maxScore: z.coerce.number().positive().max(1000).optional(),
  deadlineAt: z.string().datetime({ offset: true }).optional(),
  allowLateSubmission: z.boolean().optional(),
});

export const createSubmissionUploadUrlSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment'),
  fileName: z.string().trim().min(1, 'fileName is required').max(255),
  contentType: z.string().trim().min(1),
  fileSizeBytes: z.coerce.number().int().positive().max(MAX_SUBMISSION_BYTES),
});

export const finalizeSubmissionSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment'),
  storageKey: z.string().trim().min(3).max(500),
});

export const gradeSubmissionSchema = z.object({
  score: z.coerce.number().min(0).max(1000),
  feedback: z.string().trim().max(5000).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type CreateSubmissionUploadUrlInput = z.infer<typeof createSubmissionUploadUrlSchema>;
export type FinalizeSubmissionInput = z.infer<typeof finalizeSubmissionSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
