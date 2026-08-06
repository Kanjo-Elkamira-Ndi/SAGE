import { z } from 'zod';

export const userStatusSchema = z.object({
  isActive: z.boolean({ message: 'isActive must be a boolean' }),
});

export const userRoleSchema = z.object({
  role: z.enum(['student', 'lecturer', 'admin']),
});

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Code must be at least 2 characters')
    .max(12)
    .regex(/^[A-Z0-9]+$/, 'Code must contain only letters and digits (e.g. CSC)'),
});

export const updateDepartmentSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(2)
      .max(12)
      .regex(/^[A-Z0-9]+$/, 'Code must contain only letters and digits (e.g. CSC)')
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'No fields to update' });

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(['student', 'lecturer', 'admin']).optional(),
  status: z.enum(['active', 'pending', 'deactivated']).optional(),
  q: z.string().trim().max(200).optional(),
});

export const listActivityLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.string().uuid('Invalid user').optional(),
  action: z.string().trim().max(100).optional(),
});

export const grantPermissionSchema = z.object({
  permission: z.string().trim().min(1).max(80),
});

export const revokePermissionSchema = grantPermissionSchema;

export const recomputeSnapshotsSchema = z.object({
  courseId: z.string().uuid('Invalid course').optional(),
});

export const atRiskQuerySchema = z.object({
  level: z.enum(['low', 'medium', 'high']).optional(),
  minScore: z.coerce.number().min(0).max(1).optional(),
});

export type UserStatusInput = z.infer<typeof userStatusSchema>;
export type UserRoleInput = z.infer<typeof userRoleSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ListActivityLogsQuery = z.infer<typeof listActivityLogsQuerySchema>;
export type GrantPermissionInput = z.infer<typeof grantPermissionSchema>;
export type RecomputeSnapshotsInput = z.infer<typeof recomputeSnapshotsSchema>;
export type AtRiskQuery = z.infer<typeof atRiskQuerySchema>;
