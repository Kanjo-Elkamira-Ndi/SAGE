// Runs before every test file. Provides a valid env for modules that read it
// at import time (config/env). Values are dummies — tests never touch the DB.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/sage_test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.GROQ_MODEL = 'openai/gpt-oss-20b';
process.env.GROQ_MAX_TOKENS = '2048';
process.env.GROQ_TEMPERATURE = '0.7';
process.env.QUIZ_GENERATE_MAX_PER_MINUTE = '6';
process.env.MAX_MATERIAL_TEXT_CHARS = '15000';
