import crypto from 'crypto';
import { pool } from '../../config/db';
import { AppError } from '../../lib/errors';

export type NotificationType =
  | 'deadline_reminder'
  | 'new_material'
  | 'announcement'
  | 'feedback'
  | 'ai_study_plan'
  | 'system';

export interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
}

export interface IdempotentNotificationInput extends NotificationInput {
  eventType: string;
  eventRefId: string;
}

export interface NotificationRow {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: Date;
}

function toNotification(row: Record<string, unknown>): NotificationRow {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as NotificationType,
    title: row.title as string,
    body: (row.body as string | null) ?? null,
    relatedEntityType: (row.related_entity_type as string | null) ?? null,
    relatedEntityId: (row.related_entity_id as string | null) ?? null,
    isRead: row.is_read as boolean,
    createdAt: row.created_at as Date,
  };
}

/**
 * Deterministic uuid v5-style key from an arbitrary string, for use as
 * `notifications_sent.event_ref_id`. Lets cron jobs key idempotency on
 * values like `${studentId}:2026-08-06` while keeping the uuid column type.
 */
export function uuidFromString(input: string): string {
  const hash = crypto.createHash('sha256').update(input).digest();
  const bytes = hash.subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Direct notification insert (non-idempotent) — used by live user actions. */
export async function insertNotification(input: NotificationInput): Promise<NotificationRow> {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, type, title, body, related_entity_type, related_entity_id, is_read, created_at`,
    [
      input.userId,
      input.type,
      input.title,
      input.body ?? null,
      input.relatedEntityType ?? null,
      input.relatedEntityId ?? null,
    ],
  );
  return toNotification(result.rows[0] as Record<string, unknown>);
}

/**
 * Cron-style notification with dedupe. Writes the `notifications_sent` guard
 * row (UNIQUE user_id, event_type, event_ref_id) and the notification in one
 * transaction; returns false if the event was already sent.
 */
export async function sendIdempotentNotification(
  input: IdempotentNotificationInput,
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const guard = await client.query(
      `INSERT INTO notifications_sent (user_id, event_type, event_ref_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, event_type, event_ref_id) DO NOTHING
       RETURNING id`,
      [input.userId, input.eventType, input.eventRefId],
    );
    if (guard.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }
    await client.query(
      `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        input.userId,
        input.type,
        input.title,
        input.body ?? null,
        input.relatedEntityType ?? null,
        input.relatedEntityId ?? null,
      ],
    );
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Batch variant of `sendIdempotentNotification` for cron hot paths. Inserts all
 * guard rows and all newly-sent notifications in a single transaction using
 * array UNNESTs, so N notifications cost a handful of round trips instead of N
 * sequential transactions. Returns the number of notifications actually sent
 * (i.e. guards that were not already present).
 */
export async function sendIdempotentNotificationsBatch(
  inputs: IdempotentNotificationInput[],
): Promise<number> {
  if (inputs.length === 0) return 0;

  const userIds = inputs.map((i) => i.userId);
  const eventTypes = inputs.map((i) => i.eventType);
  const eventRefIds = inputs.map((i) => i.eventRefId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const guard = await client.query(
      `INSERT INTO notifications_sent (user_id, event_type, event_ref_id)
       SELECT * FROM unnest($1::uuid[], $2::text[], $3::uuid[])
       ON CONFLICT (user_id, event_type, event_ref_id) DO NOTHING
       RETURNING event_ref_id`,
      [userIds, eventTypes, eventRefIds],
    );

    const newlySent = new Set(guard.rows.map((row) => row.event_ref_id as string));
    if (newlySent.size === 0) {
      await client.query('COMMIT');
      return 0;
    }

    const toNotify = inputs.filter((i) => newlySent.has(i.eventRefId));
    await client.query(
      `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
       SELECT * FROM unnest(
         $1::uuid[], $2::text[], $3::text[], $4::text[], $5::text[], $6::uuid[]
       )`,
      [
        toNotify.map((i) => i.userId),
        toNotify.map((i) => i.type),
        toNotify.map((i) => i.title),
        toNotify.map((i) => i.body ?? null),
        toNotify.map((i) => i.relatedEntityType ?? null),
        toNotify.map((i) => i.relatedEntityId ?? null),
      ],
    );

    await client.query('COMMIT');
    return newlySent.size;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function listNotifications(
  userId: string,
  opts: { page: number; limit: number; isRead?: boolean; type?: string },
): Promise<{ items: NotificationRow[]; total: number; unread: number }> {
  const where = ['user_id = $1'];
  const params: unknown[] = [userId];
  let index = 2;
  if (opts.isRead !== undefined) {
    where.push(`is_read = $${index}`);
    params.push(opts.isRead);
    index += 1;
  }
  if (opts.type) {
    where.push(`type = $${index}`);
    params.push(opts.type);
    index += 1;
  }
  const whereSql = where.join(' AND ');
  const totalResult = await pool.query(`SELECT COUNT(*)::int AS total FROM notifications WHERE ${whereSql}`, params);
  const result = await pool.query(
    `SELECT id, user_id, type, title, body, related_entity_type, related_entity_id, is_read, created_at
       FROM notifications
      WHERE ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${index} OFFSET $${index + 1}`,
    [...params, opts.limit, (opts.page - 1) * opts.limit],
  );
  const unreadResult = await pool.query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId],
  );
  return {
    items: result.rows.map(toNotification),
    total: totalResult.rows[0].total as number,
    unread: unreadResult.rows[0].count as number,
  };
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<NotificationRow> {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, type, title, body, related_entity_type, related_entity_id, is_read, created_at`,
    [notificationId, userId],
  );
  if (!result.rows.length) {
    throw new AppError('NOTIFICATION_NOT_FOUND', 'Notification not found.', 404);
  }
  return toNotification(result.rows[0] as Record<string, unknown>);
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
  return result.rowCount ?? 0;
}
