import { pool } from '../config/db';
import { logger } from '../lib/logger';
import { sendIdempotentNotification, uuidFromString } from '../modules/notifications/notifications.service';

export interface DigestMaterial {
  title: string;
  type: 'pdf' | 'pptx' | 'notes';
  courseTitle: string;
}

export interface DigestGroup {
  courseTitle: string;
  materials: DigestMaterial[];
}

/** Group a flat material list by course, preserving order. */
export function groupMaterialsByCourse(materials: DigestMaterial[]): DigestGroup[] {
  const byCourse = new Map<string, DigestGroup>();
  for (const material of materials) {
    const existing = byCourse.get(material.courseTitle);
    if (existing) {
      existing.materials.push(material);
    } else {
      byCourse.set(material.courseTitle, { courseTitle: material.courseTitle, materials: [material] });
    }
  }
  return [...byCourse.values()];
}

/** Markdown-ish digest body, e.g. "• CSC301 — Intro slides (pdf)". */
export function formatDigestBody(groups: DigestGroup[]): string {
  const lines: string[] = [];
  for (const group of groups) {
    lines.push(`## ${group.courseTitle}`);
    for (const material of group.materials) {
      lines.push(`- ${material.title} (${material.type})`);
    }
  }
  return lines.join('\n');
}

/**
 * Daily "new materials" digest. For every enrolled, active student, sends one
 * notification per day summarising materials added in the last 24h to their
 * courses. Idempotent per student-day via notifications_sent.
 */
export async function runMaterialDigest(now: Date = new Date()): Promise<{
  students: number;
  materials: number;
  sent: number;
}> {
  const materialsResult = await pool.query<Record<string, unknown>>(
    `SELECT m.title, m.type, c.title AS course_title
       FROM materials m
       JOIN courses c ON c.id = m.course_id
      WHERE m.is_current = true
        AND m.created_at > now() - interval '24 hours'`,
  );
  if (materialsResult.rows.length === 0) {
    logger.info('material_digest: no new materials in last 24h');
    return { students: 0, materials: 0, sent: 0 };
  }

  const materials: DigestMaterial[] = materialsResult.rows.map((row) => ({
    title: row.title as string,
    type: row.type as DigestMaterial['type'],
    courseTitle: row.course_title as string,
  }));

  const studentsResult = await pool.query<Record<string, unknown>>(
    `SELECT DISTINCT e.student_id
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
      WHERE u.is_active = true
        AND EXISTS (
          SELECT 1 FROM materials m
           JOIN courses c ON c.id = m.course_id
          WHERE m.course_id = e.course_id
            AND m.is_current = true
            AND m.created_at > now() - interval '24 hours'
        )`,
  );

  const dateKey = now.toISOString().slice(0, 10);
  const body = formatDigestBody(groupMaterialsByCourse(materials));
  let sent = 0;
  for (const row of studentsResult.rows) {
    const studentId = row.student_id as string;
    const didSend = await sendIdempotentNotification({
      userId: studentId,
      type: 'new_material',
      title: `${materials.length} new material${materials.length === 1 ? '' : 's'} in your courses`,
      body,
      eventType: 'material_digest',
      eventRefId: uuidFromString(`${studentId}:${dateKey}`),
    });
    if (didSend) sent += 1;
  }

  logger.info('material_digest complete', {
    students: studentsResult.rows.length,
    materials: materials.length,
    sent,
  });
  return { students: studentsResult.rows.length, materials: materials.length, sent };
}
