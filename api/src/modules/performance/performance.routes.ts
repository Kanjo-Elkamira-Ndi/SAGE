import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import * as ctrl from './performance.controller';

// Student-facing + lecturer-facing routes, mounted at /performance
export const performanceRoutes = Router();

performanceRoutes.use(requireAuth);
performanceRoutes.get('/me', requireRole('student'), ctrl.me);
performanceRoutes.get('/me/risk', requireRole('student'), ctrl.myRisk);
performanceRoutes.get('/courses/:id', requireRole('lecturer'), ctrl.coursePerformance);
