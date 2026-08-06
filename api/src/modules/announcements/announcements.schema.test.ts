import { describe, expect, it } from 'vitest';
import { createAnnouncementSchema, updateAnnouncementSchema } from './announcements.schema';

describe('createAnnouncementSchema', () => {
  it('accepts a valid school-wide announcement', () => {
    const result = createAnnouncementSchema.parse({
      title: 'Midterm rescheduled',
      body: 'The midterm exam moves to Friday.',
    });
    expect(result.courseId).toBeUndefined();
  });

  it('accepts a course-scoped announcement', () => {
    const result = createAnnouncementSchema.parse({
      title: 'Lab notice',
      body: 'Lab closed tomorrow.',
      courseId: '11111111-1111-4111-8111-111111111111',
    });
    expect(result.courseId).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('rejects a title shorter than 3 characters', () => {
    expect(() => createAnnouncementSchema.parse({ title: 'Hi', body: 'body' })).toThrow();
  });

  it('accepts an explicit null courseId (school-wide)', () => {
    const result = createAnnouncementSchema.parse({
      title: 'Holiday notice',
      body: 'Campus closed.',
      courseId: null,
    });
    expect(result.courseId).toBeNull();
  });

  it('rejects an invalid courseId', () => {
    expect(() => createAnnouncementSchema.parse({ title: 'Hello', body: 'body', courseId: 'nope' })).toThrow();
  });

  it('rejects missing body', () => {
    expect(() => createAnnouncementSchema.parse({ title: 'Hello' })).toThrow();
  });
});

describe('updateAnnouncementSchema', () => {
  it('accepts a partial update', () => {
    const result = updateAnnouncementSchema.parse({ body: 'Updated body' });
    expect(result.body).toBe('Updated body');
  });

  it('accepts clearing courseId', () => {
    const result = updateAnnouncementSchema.parse({ courseId: null });
    expect(result.courseId).toBeNull();
  });

  it('rejects an empty object', () => {
    const result = updateAnnouncementSchema.parse({});
    expect(result).toEqual({});
  });
});
