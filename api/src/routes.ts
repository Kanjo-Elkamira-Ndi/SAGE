import { Router } from 'express';
import { logger } from './lib/logger';
import { authRoutes } from './modules/auth/auth.routes';
import { adminCourseRoutes, courseRoutes } from './modules/courses/courses.routes';
import { materialRoutes } from './modules/materials/materials.routes';
import { assignmentRoutes, submissionRoutes } from './modules/assignments/assignments.routes';
import { examRoutes } from './modules/exams/exams.routes';
import { quizRoutes } from './modules/quizzes/quizzes.routes';

export const apiRouter = Router();

// Placeholder so /v1 has a verifiable route before feature modules land.
apiRouter.get('/ping', (_req, res) => {
  logger.debug('ping received');
  res.json({ success: true, data: { pong: true } });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/materials', materialRoutes);
apiRouter.use('/assignments', assignmentRoutes);
apiRouter.use('/submissions', submissionRoutes);
apiRouter.use('/exams', examRoutes);
apiRouter.use('/quizzes', quizRoutes);
apiRouter.use('/admin/courses', adminCourseRoutes);
