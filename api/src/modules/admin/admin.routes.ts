import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import * as adminController from './admin.controller';

export default function adminRoutes(): Router {
  const router = Router();

  router.use(requireAuth, requireRole('admin'));

  router.get('/dashboard/stats', adminController.getDashboardStats);
  router.get('/users', adminController.listUsers);
  router.patch('/users/:userId/status', adminController.updateUserStatus);
  router.patch('/users/:userId/role', adminController.updateUserRole);
  router.get('/users/:userId/permissions', adminController.getUserPermissions);
  router.post('/users/:userId/permissions', adminController.grantPermission);
  router.delete('/users/:userId/permissions', adminController.revokePermission);

  router.get('/departments', adminController.listDepartments);
  router.post('/departments', adminController.createDepartment);
  router.patch('/departments/:departmentId', adminController.updateDepartment);

  router.get('/activity-logs', adminController.listActivityLogs);

  router.get('/reports/at-risk', adminController.getAtRiskReport);
  router.get('/reports/at-risk/export', adminController.exportAtRiskReport);
  router.post('/performance/recompute-snapshots', adminController.recomputeSnapshots);

  return router;
}
