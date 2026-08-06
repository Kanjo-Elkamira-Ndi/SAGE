import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import * as announcementsController from './announcements.controller';

export default function announcementsRoutes(): Router {
  const router = Router();

  router.get('/', requireAuth, announcementsController.listAnnouncements);
  router.post('/', requireAuth, requireRole('admin', 'lecturer'), announcementsController.createAnnouncement);
  router.patch('/:id', requireAuth, requireRole('admin', 'lecturer'), announcementsController.updateAnnouncement);
  router.delete('/:id', requireAuth, requireRole('admin'), announcementsController.deleteAnnouncement);

  return router;
}
