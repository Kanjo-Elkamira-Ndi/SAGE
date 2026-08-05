import { pool } from '../../config/db';
import { logActivity } from '../../lib/activity';
import { AppError } from '../../lib/errors';
import {
  ALLOWED_MATERIAL_MIME_TYPES,
  createMaterialDownloadUrl,
  createMaterialUploadUrl,
  materialTypeFromMime,
  objectExists,
} from '../../lib/storage';
import { getCourseOrThrow, isCourseOwner, isEnrolled } from '../courses/courses.service';
import type {
  CreateMaterialUploadUrlInput,
  FinalizeMaterialInput,
  NewVersionMaterialInput,
} from './materials.schema';

export type MaterialType = 'pdf' | 'pptx' | 'notes';

export interface MaterialRow {
  id: string;
  courseId: string;
  uploadedBy: string;
  title: string;
  type: MaterialType;
  storageKey: string;
  fileSizeBytes: number | null;
  version: number;
  isCurrent: boolean;
  replacesMaterialId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const MATERIAL_SELECT = `
  SELECT id, course_id, uploaded_by, title, type, storage_key, file_size_bytes,
         version, is_current, replaces_material_id, created_at, updated_at
  FROM materials
`;

function toMaterial(row: Record<string, unknown>): MaterialRow {
  return {
    id: row.id as string,
    courseId: row.course_id as string,
    uploadedBy: row.uploaded_by as string,
    title: row.title as string,
    type: row.type as MaterialType,
    storageKey: row.storage_key as string,
    fileSizeBytes: (row.file_size_bytes as number | null) ?? null,
    version: row.version as number,
    isCurrent: row.is_current as boolean,
    replacesMaterialId: (row.replaces_material_id as string | null) ?? null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

async function assertLecturerOwnsCourse(courseId: string, lecturerId: string): Promise<void> {
  if (!(await isCourseOwner(courseId, lecturerId))) {
    throw new AppError('NOT_COURSE_OWNER', 'You can only manage materials for your own courses.', 403);
  }
}

async function assertCanDownload(
  user: { id: string; role: string },
  material: MaterialRow,
): Promise<void> {
  if (user.role === 'admin') return;
  if (user.role === 'lecturer') {
    if (!(await isCourseOwner(material.courseId, user.id))) {
      throw new AppError('NOT_COURSE_OWNER', 'You do not have access to this material.', 403);
    }
    return;
  }
  if (!(await isEnrolled(material.courseId, user.id))) {
    throw new AppError('NOT_ENROLLED', 'Enroll in this course to access its materials.', 403);
  }
}

async function lecturerName(userId: string): Promise<string> {
  const result = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
  return (result.rows[0]?.full_name as string | undefined) ?? 'Your lecturer';
}

async function notifyEnrolledStudents(
  courseId: string,
  title: string,
  materialId: string,
  actorName: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
     SELECT student_id, 'new_material', 'New material', $2, 'material', $3
       FROM enrollments
      WHERE course_id = $1 AND status = 'active'`,
    [courseId, `"${title}" was added by ${actorName}.`, materialId],
  );
}

export async function createUploadUrl(
  input: CreateMaterialUploadUrlInput,
  lecturerId: string,
): Promise<{ uploadUrl: string; storageKey: string; expiresInSeconds: number }> {
  await getCourseOrThrow(input.courseId);
  await assertLecturerOwnsCourse(input.courseId, lecturerId);
  return createMaterialUploadUrl({
    courseId: input.courseId,
    contentType: input.contentType,
    fileSizeBytes: input.fileSizeBytes,
    fileName: input.fileName,
  });
}

export async function finalizeMaterial(
  input: FinalizeMaterialInput,
  lecturerId: string,
): Promise<MaterialRow> {
  await getCourseOrThrow(input.courseId);
  await assertLecturerOwnsCourse(input.courseId, lecturerId);
  const type = materialTypeFromMime(input.contentType);
  if (!type) {
    throw new AppError(
      'UNSUPPORTED_FILE_TYPE',
      `File type not allowed. Supported: ${ALLOWED_MATERIAL_MIME_TYPES.join(', ')}.`,
      400,
    );
  }
  if (!(await objectExists(input.storageKey))) {
    throw new AppError('MATERIAL_FILE_MISSING', 'The uploaded file was not found in storage.', 400);
  }

  const result = await pool.query(
    `INSERT INTO materials (course_id, uploaded_by, title, type, storage_key, file_size_bytes, version, is_current)
     VALUES ($1, $2, $3, $4, $5, $6, 1, true)
     RETURNING id`,
    [input.courseId, lecturerId, input.title, type, input.storageKey, input.fileSizeBytes],
  );
  const material = await getMaterialOrThrow(result.rows[0].id);
  const actorName = await lecturerName(lecturerId);
  await notifyEnrolledStudents(input.courseId, material.title, material.id, actorName);
  await logActivity({
    userId: lecturerId,
    action: 'materials.create',
    entityType: 'material',
    entityId: material.id,
    metadata: { courseId: input.courseId, title: material.title, type },
  });
  return material;
}

export async function listMaterialsForCourse(courseId: string): Promise<MaterialRow[]> {
  const result = await pool.query(
    `${MATERIAL_SELECT} WHERE course_id = $1 AND is_current = true ORDER BY created_at DESC`,
    [courseId],
  );
  return result.rows.map(toMaterial);
}

export async function getMaterial(materialId: string): Promise<MaterialRow | null> {
  const result = await pool.query(`${MATERIAL_SELECT} WHERE id = $1`, [materialId]);
  return result.rows.length ? toMaterial(result.rows[0]) : null;
}

export async function getMaterialOrThrow(materialId: string): Promise<MaterialRow> {
  const material = await getMaterial(materialId);
  if (!material) {
    throw new AppError('MATERIAL_NOT_FOUND', 'Material not found.', 404);
  }
  return material;
}

export async function addNewVersion(
  materialId: string,
  input: NewVersionMaterialInput,
  lecturerId: string,
): Promise<MaterialRow> {
  const existing = await getMaterialOrThrow(materialId);
  await assertLecturerOwnsCourse(existing.courseId, lecturerId);
  const type = materialTypeFromMime(input.contentType);
  if (!type) {
    throw new AppError(
      'UNSUPPORTED_FILE_TYPE',
      `File type not allowed. Supported: ${ALLOWED_MATERIAL_MIME_TYPES.join(', ')}.`,
      400,
    );
  }
  if (input.courseId && input.courseId !== existing.courseId) {
    throw new AppError('COURSE_MISMATCH', 'Material cannot be moved to another course.', 400);
  }
  if (!(await objectExists(input.storageKey))) {
    throw new AppError('MATERIAL_FILE_MISSING', 'The uploaded file was not found in storage.', 400);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE materials SET is_current = false WHERE id = $1`, [existing.id]);
    const result = await client.query(
      `INSERT INTO materials (course_id, uploaded_by, title, type, storage_key, file_size_bytes, version, is_current, replaces_material_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
       RETURNING id`,
      [
        existing.courseId,
        lecturerId,
        input.title ?? existing.title,
        type,
        input.storageKey,
        input.fileSizeBytes,
        existing.version + 1,
        existing.id,
      ],
    );
    await client.query('COMMIT');
    const material = await getMaterialOrThrow(result.rows[0].id);
    const actorName = await lecturerName(lecturerId);
    await notifyEnrolledStudents(existing.courseId, material.title, material.id, actorName);
    await logActivity({
      userId: lecturerId,
      action: 'materials.new_version',
      entityType: 'material',
      entityId: material.id,
      metadata: {
        courseId: existing.courseId,
        title: material.title,
        version: material.version,
        replaces: existing.id,
      },
    });
    return material;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function downloadUrl(
  materialId: string,
  user: { id: string; role: string },
): Promise<{ downloadUrl: string; expiresInSeconds: number; material: MaterialRow }> {
  const material = await getMaterialOrThrow(materialId);
  await assertCanDownload(user, material);
  const { downloadUrl: url, expiresInSeconds } = await createMaterialDownloadUrl(material.storageKey);
  return { downloadUrl: url, expiresInSeconds, material };
}
