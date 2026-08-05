import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool, pingDatabase } from './config/db';
import { corsOriginList } from './config/env';
import { httpLogger } from './lib/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';

export function createApp(): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: corsOriginList,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(httpLogger);

  app.get('/health', async (_req, res) => {
    const dbOk = await pingDatabase();
    if (!dbOk) {
      res.status(503).json({
        success: false,
        error: { code: 'DB_UNAVAILABLE', message: 'Database unavailable' },
      });
      return;
    }
    res.json({
      success: true,
      data: { status: 'ok', database: 'connected', poolSize: pool.totalCount },
    });
  });

  app.use('/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
