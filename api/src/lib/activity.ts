import { pool } from '../config/db';

export interface ActivityLogInput {
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
}

export async function logActivity(input: ActivityLogInput): Promise<void> {
  await pool.query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.userId ?? null,
      input.action,
      input.entityType ?? null,
      input.entityId ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
      input.ip ?? null,
    ],
  );
}
