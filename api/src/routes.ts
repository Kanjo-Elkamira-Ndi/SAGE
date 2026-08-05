import { Router } from 'express';
import { logger } from './lib/logger';
import { authRoutes } from './modules/auth/auth.routes';

export const apiRouter = Router();

// Placeholder so /v1 has a verifiable route before feature modules land.
apiRouter.get('/ping', (_req, res) => {
  logger.debug('ping received');
  res.json({ success: true, data: { pong: true } });
});

apiRouter.use('/auth', authRoutes);

// Feature modules mount here in later phases, e.g.:
// apiRouter.use('/courses', courseRoutes);
