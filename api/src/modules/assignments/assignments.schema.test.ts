import { describe, expect, it } from 'vitest';
import { MAX_SUBMISSION_BYTES } from '../../lib/storage';
import {
  createAssignmentSchema,
  createSubmissionUploadUrlSchema,
  finalizeSubmissionSchema,
  gradeSubmissionSchema,
  updateAssignmentSchema,
} from './assignments.schema';

const courseId = 'a3e1e9ee-2e9a-4e4d-9f4e-0c7b0b1b2c3d';
const assignmentId = 'b4f2faff-3f0b-4f5e-8a5f-1d8c1c2d3e4f';

describe('createAssignmentSchema', () => {
  it('accepts a valid assignment with defaults', () => {
    const out = createAssignmentSchema.parse({
      courseId,
      title: 'Data Structures HW1',
      deadlineAt: '2026-08-20T12:00:00.000Z',
    });
    expect(out.maxScore).toBe(100);
    expect(out.allowLateSubmission).toBe(false);
  });

  it('coerces maxScore and allows full options', () => {
    const out = createAssignmentSchema.parse({
      courseId,
      title: 'HW2',
      instructions: 'Solve all problems.',
      maxScore: '50',
      deadlineAt: '2026-08-20T12:00:00.000Z',
      allowLateSubmission: true,
    });
    expect(out.maxScore).toBe(50);
    expect(out.allowLateSubmission).toBe(true);
  });

  it('rejects short title / bad deadline / negative maxScore', () => {
    expect(() =>
      createAssignmentSchema.parse({ courseId, title: 'AB', deadlineAt: '2026-08-20T12:00:00.000Z' }),
    ).toThrow();
    expect(() =>
      createAssignmentSchema.parse({ courseId, title: 'OK', deadlineAt: 'not-a-date' }),
    ).toThrow();
    expect(() =>
      createAssignmentSchema.parse({ courseId, title: 'OK', maxScore: -1, deadlineAt: '2026-08-20T12:00:00.000Z' }),
    ).toThrow();
  });
});

describe('updateAssignmentSchema', () => {
  it('accepts partial updates and null instructions', () => {
    const out = updateAssignmentSchema.parse({ instructions: null, allowLateSubmission: true });
    expect(out.instructions).toBeNull();
    expect(out.allowLateSubmission).toBe(true);
  });

  it('accepts an empty no-op object', () => {
    expect(updateAssignmentSchema.parse({})).toEqual({});
  });
});

describe('createSubmissionUploadUrlSchema', () => {
  it('accepts a valid request and coerces size', () => {
    const out = createSubmissionUploadUrlSchema.parse({
      assignmentId,
      fileName: 'hw1-solution.pdf',
      contentType: 'application/pdf',
      fileSizeBytes: '2048',
    });
    expect(out.fileSizeBytes).toBe(2048);
  });

  it('rejects oversized files', () => {
    expect(() =>
      createSubmissionUploadUrlSchema.parse({
        assignmentId,
        fileName: 'big.zip',
        contentType: 'application/zip',
        fileSizeBytes: MAX_SUBMISSION_BYTES + 1,
      }),
    ).toThrow();
  });
});

describe('finalizeSubmissionSchema', () => {
  it('accepts assignmentId + storageKey', () => {
    const out = finalizeSubmissionSchema.parse({
      assignmentId,
      storageKey: `${assignmentId}/abc123-uuid-hw1.pdf`,
    });
    expect(out.storageKey).toBe(`${assignmentId}/abc123-uuid-hw1.pdf`);
  });
});

describe('gradeSubmissionSchema', () => {
  it('accepts score with optional feedback', () => {
    expect(gradeSubmissionSchema.parse({ score: 85 }).score).toBe(85);
    expect(gradeSubmissionSchema.parse({ score: 85, feedback: 'Good work' }).feedback).toBe('Good work');
  });

  it('rejects negative or huge scores', () => {
    expect(() => gradeSubmissionSchema.parse({ score: -1 })).toThrow();
    expect(() => gradeSubmissionSchema.parse({ score: 1001 })).toThrow();
  });
});
