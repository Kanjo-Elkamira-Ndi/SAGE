import type { Request, Response } from 'express';
import { parsePagination } from '../../lib/pagination';
import { paramString } from '../../lib/params';
import * as notificationService from './notifications.service';

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const { page, limit } = parsePagination(req.query);
  const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
  const type = typeof req.query.type === 'string' ? req.query.type : undefined;
  const data = await notificationService.listNotifications(req.user!.id, { page, limit, isRead, type });
  res.json({ success: true, data });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const notification = await notificationService.markNotificationRead(
    paramString(req.params.id),
    req.user!.id,
  );
  res.json({ success: true, data: { notification } });
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  const updated = await notificationService.markAllNotificationsRead(req.user!.id);
  res.json({ success: true, data: { updated } });
}
