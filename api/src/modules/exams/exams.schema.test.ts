import { describe, expect, it } from 'vitest';
import { createExamSchema, updateExamSchema } from './exams.schema';

const courseId = 'a3e1e9ee-2e9a-4e4d-9f4e-0c7b0b1b2c3d';

describe('createExamSchema', () => {
  it('accepts a valid exam', () => {
    const out = createExamSchema.parse({
      courseId,
      title: 'Midterm',
      scheduledAt: '2026-10-01T09:00:00.000Z',
      durationMinutes: 90,
      venue: 'Hall B',
      instructions: 'Closed book.',
    });
    expect(out.durationMinutes).toBe(90);
    expect(out.venue).toBe('Hall B');
  });

  it('accepts the minimal required fields', () => {
    const out = createExamSchema.parse({
      courseId,
      title: 'Final',
      scheduledAt: '2026-12-01T09:00:00.000Z',
    });
    expect(out.durationMinutes).toBeUndefined();
  });

  it('rejects a bad scheduledAt or too-short title', () => {
    expect(() =>
      createExamSchema.parse({ courseId, title: 'OK', scheduledAt: 'tomorrow-ish' }),
    ).toThrow();
    expect(() => createExamSchema.parse({ courseId, title: 'X', scheduledAt: '2026-12-01T09:00:00.000Z' })).toThrow();
  });
});

describe('updateExamSchema', () => {
  it('accepts partial updates and null clearing', () => {
    const out = updateExamSchema.parse({ venue: null, durationMinutes: 120 });
    expect(out.venue).toBeNull();
    expect(out.durationMinutes).toBe(120);
  });
});
