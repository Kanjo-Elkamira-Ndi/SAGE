import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default('materials'),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('openai/gpt-oss-20b'),
  GROQ_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
  GROQ_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.7),
  QUIZ_GENERATE_MAX_PER_MINUTE: z.coerce.number().int().positive().default(6),
  MAX_MATERIAL_TEXT_CHARS: z.coerce.number().int().positive().default(15000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('FATAL: invalid environment configuration');
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = parsed.data;

export const corsOriginList: string[] = env.CORS_ORIGINS.split(',')
  .map((s) => s.trim())
  .filter(Boolean);
