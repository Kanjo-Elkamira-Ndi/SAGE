import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import * as ctrl from './quizzes.controller';
import { createQuizSchema, submitQuizSchema, updateQuizSchema } from './quizzes.schema';

export const quizRoutes = Router();

quizRoutes.use(requireAuth);

quizRoutes.post('/', requireRole('lecturer'), validate(createQuizSchema), ctrl.createQuiz);
quizRoutes.patch('/:id', requireRole('lecturer'), validate(updateQuizSchema), ctrl.updateQuiz);
quizRoutes.post('/:id/start', requireRole('student'), ctrl.startAttempt);
quizRoutes.post('/:id/submit', requireRole('student'), validate(submitQuizSchema), ctrl.submitAttempt);
quizRoutes.get('/:id/results', requireRole('student'), ctrl.results);
