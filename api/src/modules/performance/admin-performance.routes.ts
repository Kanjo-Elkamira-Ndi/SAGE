import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import * as ctrl from './performance.controller';

// Admin-only routes, mounted at /admin/performance
export const adminPerformanceRoutes = Router();

adminPerformanceRoutes.use(requireAuth);
adminPerformanceRoutes.get('/at-risk', requireRole('admin'), ctrl.atRisk);
adminPerformanceRoutes.post('/recompute-snapshots', requireRole('admin'), ctrl.recomputeSnapshots);
