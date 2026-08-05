import { describe, expect, it } from 'vitest';
import { createCourseSchema, updateCourseSchema } from './courses.schema';

describe('createCourseSchema', () => {
  it('accepts a valid course and uppercases the code', () => {
    const out = createCourseSchema.parse({
      title: 'Data Structures',
      code: 'csc301',
      creditUnits: 3,
    });
    expect(out.code).toBe('CSC301');
    expect(out.creditUnits).toBe(3);
  });

  it('accepts optional fields', () => {
    const out = createCourseSchema.parse({
      title: 'Algorithms',
      code: 'CSC302',
      description: 'Advanced algorithms',
      departmentId: 'a3e1e9ee-2e9a-4e4d-9f4e-0c7b0b1b2c3d',
      semester: '2026-2',
      outline: '# Week 1',
    });
    expect(out.description).toBe('Advanced algorithms');
    expect(out.semester).toBe('2026-2');
  });

  it('rejects short title / short or invalid code', () => {
    expect(() => createCourseSchema.parse({ title: 'AB', code: 'CS' })).toThrow();
    expect(() => createCourseSchema.parse({ title: 'OK', code: 'C' })).toThrow();
    expect(() => createCourseSchema.parse({ title: 'OK', code: 'CSC 301' })).toThrow();
    expect(() => createCourseSchema.parse({ title: 'OK', code: 'CSC_301' })).toThrow();
  });

  it('rejects invalid department uuid', () => {
    expect(() =>
      createCourseSchema.parse({ title: 'OK', code: 'CSC303', departmentId: 'nope' }),
    ).toThrow();
  });
});

describe('updateCourseSchema', () => {
  it('accepts partial updates', () => {
    const out = updateCourseSchema.parse({ description: 'Updated' });
    expect(out.description).toBe('Updated');
    expect(out.title).toBeUndefined();
  });

  it('accepts null to clear optional fields', () => {
    const out = updateCourseSchema.parse({ departmentId: null, creditUnits: null });
    expect(out.departmentId).toBeNull();
    expect(out.creditUnits).toBeNull();
  });

  it('rejects empty object as valid no-op', () => {
    expect(updateCourseSchema.parse({})).toEqual({});
  });
});
