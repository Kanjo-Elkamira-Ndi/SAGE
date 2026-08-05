import { Router } from 'express';
import { logger } from './lib/logger';
import { authRoutes } from './modules/auth/auth.routes';
import { adminCourseRoutes, courseRoutes } from './modules/courses/courses.routes';
import { materialRoutes } from './modules/materials/materials.routes';

export const apiRouter = Router();

// Placeholder so /v1 has a verifiable route before feature modules land.
apiRouter.get('/ping', (_req, res) => {
  logger.debug('ping received');
  res.json({ success: true, data: { pong: true } });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/materials', materialRoutes);
apiRouter.use('/admin/courses', adminCourseRoutes);
