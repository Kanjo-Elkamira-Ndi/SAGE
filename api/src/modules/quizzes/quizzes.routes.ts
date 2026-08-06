import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import * as ctrl from './quizzes.controller';
import { createQuizSchema, generateQuizSchema, submitQuizSchema, updateQuizSchema } from './quizzes.schema';
import { env } from '../../config/env';

export const quizRoutes = Router();

quizRoutes.use(requireAuth);

quizRoutes.post(
  '/generate',
  requireRole('lecturer'),
  rateLimit({
    windowMs: 60_000,
    max: env.QUIZ_GENERATE_MAX_PER_MINUTE,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many quiz generations. Please wait a minute and try again.' },
    },
  }),
  validate(generateQuizSchema),
  ctrl.generateQuiz,
);

quizRoutes.post('/', requireRole('lecturer'), validate(createQuizSchema), ctrl.createQuiz);
quizRoutes.patch('/:id', requireRole('lecturer'), validate(updateQuizSchema), ctrl.updateQuiz);
quizRoutes.post('/:id/start', requireRole('student'), ctrl.startAttempt);
quizRoutes.post('/:id/submit', requireRole('student'), validate(submitQuizSchema), ctrl.submitAttempt);
quizRoutes.get('/:id/results', requireRole('student'), ctrl.results);
