import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import * as ctrl from './exams.controller';
import { createExamSchema, updateExamSchema } from './exams.schema';

export const examRoutes = Router();

examRoutes.use(requireAuth);

examRoutes.post('/', requireRole('lecturer'), validate(createExamSchema), ctrl.createExam);
examRoutes.patch('/:id', requireRole('lecturer'), validate(updateExamSchema), ctrl.updateExam);
