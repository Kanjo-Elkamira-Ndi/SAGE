import type { Request, Response } from 'express';
import { parsePagination } from '../../lib/pagination';
import { paramString } from '../../lib/params';
import { validate } from '../../middleware/validate';
import * as announcementsService from './announcements.service';
import { createAnnouncementSchema, updateAnnouncementSchema } from './announcements.schema';
import { logActivity } from '../../lib/activity';

export const createAnnouncement = [
  validate(createAnnouncementSchema),
  async (req: Request, res: Response): Promise<void> => {
    const announcement = await announcementsService.createAnnouncement(req.user!, req.body);
    const notified = await announcementsService.notifyAnnouncementAudience(announcement.id, announcement.courseId);
    await logActivity({
      userId: req.user!.id,
      action: 'announcement_created',
      entityType: 'announcement',
      entityId: announcement.id,
      metadata: { courseId: announcement.courseId, notified },
      ip: req.ip,
    });
    res.status(201).json({ success: true, data: { announcement, notified } });
  },
];

export const updateAnnouncement = [
  validate(updateAnnouncementSchema),
  async (req: Request, res: Response): Promise<void> => {
    const announcement = await announcementsService.updateAnnouncement(
      paramString(req.params.id),
      req.body,
    );
    await logActivity({
      userId: req.user!.id,
      action: 'announcement_updated',
      entityType: 'announcement',
      entityId: announcement.id,
      ip: req.ip,
    });
    res.json({ success: true, data: { announcement } });
  },
];

export async function deleteAnnouncement(req: Request, res: Response): Promise<void> {
  const id = paramString(req.params.id);
  await announcementsService.deleteAnnouncement(id);
  await logActivity({
    userId: req.user!.id,
    action: 'announcement_deleted',
    entityType: 'announcement',
    entityId: id,
    ip: req.ip,
  });
  res.status(204).send();
}

export async function listAnnouncements(req: Request, res: Response): Promise<void> {
  const { page, limit } = parsePagination(req.query);
  const data = await announcementsService.listAnnouncements({ page, limit });
  res.json({ success: true, data });
}
