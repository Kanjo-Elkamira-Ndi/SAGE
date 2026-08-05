import { describe, expect, it } from 'vitest';
import { MAX_MATERIAL_BYTES } from '../../lib/storage';
import {
  createMaterialUploadUrlSchema,
  finalizeMaterialSchema,
  newVersionMaterialSchema,
} from './materials.schema';

const courseId = 'a3e1e9ee-2e9a-4e4d-9f4e-0c7b0b1b2c3d';

describe('createMaterialUploadUrlSchema', () => {
  it('accepts a valid request', () => {
    const out = createMaterialUploadUrlSchema.parse({
      courseId,
      fileName: 'Lecture 1 Notes.pdf',
      contentType: 'application/pdf',
      fileSizeBytes: 1024,
    });
    expect(out.fileSizeBytes).toBe(1024);
  });

  it('coerces numeric strings', () => {
    const out = createMaterialUploadUrlSchema.parse({
      courseId,
      fileName: 'notes.md',
      contentType: 'text/markdown',
      fileSizeBytes: '2048',
    });
    expect(out.fileSizeBytes).toBe(2048);
  });

  it('rejects files over the size limit', () => {
    expect(() =>
      createMaterialUploadUrlSchema.parse({
        courseId,
        fileName: 'big.pdf',
        contentType: 'application/pdf',
        fileSizeBytes: MAX_MATERIAL_BYTES + 1,
      }),
    ).toThrow();
  });

  it('rejects missing fileName or bad courseId', () => {
    expect(() =>
      createMaterialUploadUrlSchema.parse({
        courseId,
        contentType: 'application/pdf',
        fileSizeBytes: 1,
      }),
    ).toThrow();
    expect(() =>
      createMaterialUploadUrlSchema.parse({
        courseId: 'nope',
        fileName: 'x.pdf',
        contentType: 'application/pdf',
        fileSizeBytes: 1,
      }),
    ).toThrow();
  });
});

describe('finalizeMaterialSchema', () => {
  it('accepts a valid finalize payload', () => {
    const out = finalizeMaterialSchema.parse({
      courseId,
      title: 'Lecture 1',
      storageKey: 'course/123-uuid-lec1.pdf',
      contentType: 'application/pdf',
      fileSizeBytes: 2048,
    });
    expect(out.title).toBe('Lecture 1');
  });

  it('rejects empty title', () => {
    expect(() =>
      finalizeMaterialSchema.parse({
        courseId,
        title: ' ',
        storageKey: 'a/b.pdf',
        contentType: 'application/pdf',
        fileSizeBytes: 1,
      }),
    ).toThrow();
  });
});

describe('newVersionMaterialSchema', () => {
  it('requires only the new file details', () => {
    const out = newVersionMaterialSchema.parse({
      storageKey: 'course/456-uuid-lec1-v2.pdf',
      contentType: 'application/pdf',
      fileSizeBytes: 4096,
    });
    expect(out.title).toBeUndefined();
    expect(out.courseId).toBeUndefined();
  });

  it('accepts optional title/courseId overrides', () => {
    const out = newVersionMaterialSchema.parse({
      courseId,
      title: 'Lecture 1 (rev 2)',
      storageKey: 'a/b.pdf',
      contentType: 'application/pdf',
      fileSizeBytes: 10,
    });
    expect(out.title).toBe('Lecture 1 (rev 2)');
  });
});
