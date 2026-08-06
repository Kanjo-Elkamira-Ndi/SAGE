import { describe, expect, it } from 'vitest';
import {
  createDepartmentSchema,
  grantPermissionSchema,
  listActivityLogsQuerySchema,
  listUsersQuerySchema,
  updateDepartmentSchema,
  userRoleSchema,
  userStatusSchema,
} from './admin.schema';

describe('userStatusSchema', () => {
  it('accepts a boolean', () => {
    expect(userStatusSchema.parse({ isActive: false }).isActive).toBe(false);
  });

  it('rejects non-boolean values', () => {
    expect(() => userStatusSchema.parse({ isActive: 'false' })).toThrow();
  });
});

describe('userRoleSchema', () => {
  it('accepts a valid role', () => {
    expect(userRoleSchema.parse({ role: 'lecturer' }).role).toBe('lecturer');
  });

  it('rejects an unknown role', () => {
    expect(() => userRoleSchema.parse({ role: 'superuser' })).toThrow();
  });
});

describe('createDepartmentSchema', () => {
  it('normalizes code to uppercase', () => {
    const result = createDepartmentSchema.parse({ name: 'Computer Science', code: 'csc' });
    expect(result.code).toBe('CSC');
  });

  it('rejects a short name or bad code', () => {
    expect(() => createDepartmentSchema.parse({ name: 'A', code: 'CSC' })).toThrow();
    expect(() => createDepartmentSchema.parse({ name: 'Computer Science', code: 'CS C' })).toThrow();
  });
});

describe('updateDepartmentSchema', () => {
  it('accepts a partial update', () => {
    const result = updateDepartmentSchema.parse({ name: 'Mathematics' });
    expect(result.name).toBe('Mathematics');
  });

  it('rejects an empty object', () => {
    expect(() => updateDepartmentSchema.parse({})).toThrow();
  });
});

describe('listUsersQuerySchema', () => {
  it('coerces page/limit and applies defaults', () => {
    const result = listUsersQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    const coerced = listUsersQuerySchema.parse({ page: '3', limit: '10' });
    expect(coerced.page).toBe(3);
    expect(coerced.limit).toBe(10);
  });

  it('rejects an unknown status', () => {
    expect(() => listUsersQuerySchema.parse({ status: 'banned' })).toThrow();
  });
});

describe('listActivityLogsQuerySchema', () => {
  it('rejects an invalid userId', () => {
    expect(() => listActivityLogsQuerySchema.parse({ userId: 'not-a-uuid' })).toThrow();
  });
});

describe('grantPermissionSchema', () => {
  it('accepts a permission key', () => {
    expect(grantPermissionSchema.parse({ permission: 'grades:manage' }).permission).toBe('grades:manage');
  });
});
