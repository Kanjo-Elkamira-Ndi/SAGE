import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import * as notificationsController from './notifications.controller';

export default function notificationsRoutes(): Router {
  const router = Router();

  router.get('/', requireAuth, notificationsController.listNotifications);
  router.patch('/read-all', requireAuth, notificationsController.markAllRead);
  router.patch('/:id/read', requireAuth, notificationsController.markRead);

  return router;
}
