import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import type { Server } from 'http';
import { apiRateLimit } from './rateLimit';
import { env } from '../config/env';

const ORIGINAL_ENV = env.NODE_ENV;

function makeApp(): express.Express {
  const app = express();
  app.post(
    '/test',
    apiRateLimit({ windowMs: 60_000, max: 2, message: 'slow down' }),
    (_req, res) => {
      res.json({ success: true });
    },
  );
  return app;
}

async function start(baseApp: express.Express): Promise<{ server: Server; base: string }> {
  const server = baseApp.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as { port: number };
  return { server, base: `http://localhost:${port}` };
}

async function hit(base: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${base}/test`, { method: 'POST' });
  return { status: res.status, body: (await res.json()) as unknown };
}

describe('apiRateLimit', () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    env.NODE_ENV = 'development';
    ({ server, base } = await start(makeApp()));
  });

  afterAll(async () => {
    env.NODE_ENV = ORIGINAL_ENV;
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  });

  it('allows requests up to the limit', async () => {
    expect((await hit(base)).status).toBe(200);
    expect((await hit(base)).status).toBe(200);
  });

  it('returns 429 with the standard error shape once over the limit', async () => {
    const res = await hit(base);
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'slow down' },
    });
  });
});

describe('apiRateLimit (disabled in test env)', () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    env.NODE_ENV = 'test';
    ({ server, base } = await start(makeApp()));
  });

  afterAll(async () => {
    env.NODE_ENV = ORIGINAL_ENV;
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  });

  it('never blocks requests when NODE_ENV is test', async () => {
    for (let i = 0; i < 4; i += 1) {
      expect((await hit(base)).status).toBe(200);
    }
  });
});
