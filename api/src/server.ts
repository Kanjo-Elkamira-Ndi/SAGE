import { createApp } from './app';
import { env } from './config/env';
import { pool } from './config/db';
import { logger } from './lib/logger';

async function main(): Promise<void> {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`SAGE API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const dbOk = await pool.query('SELECT 1').then(
    () => true,
    () => false,
  );
  if (!dbOk) {
    logger.error('Database connection FAILED — check DATABASE_URL and that Postgres is running');
  } else {
    logger.info('Database connection OK');
  }

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error('Fatal error during startup', err instanceof Error ? err.message : err);
  process.exit(1);
});
