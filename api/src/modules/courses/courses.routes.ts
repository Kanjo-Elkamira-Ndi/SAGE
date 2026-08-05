import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import * as ctrl from './courses.controller';
import { createCourseSchema, updateCourseSchema } from './courses.schema';

export const courseRoutes = Router();

courseRoutes.use(requireAuth);

courseRoutes.get('/', requireRole('student', 'lecturer'), ctrl.listCourses);
courseRoutes.post('/', requireRole('lecturer', 'admin'), validate(createCourseSchema), ctrl.createCourse);
courseRoutes.get('/:id/materials', requireRole('student', 'lecturer', 'admin'), ctrl.listCourseMaterials);
courseRoutes.get('/:id', requireRole('student', 'lecturer', 'admin'), ctrl.getCourseById);
courseRoutes.patch('/:id', requireRole('lecturer', 'admin'), validate(updateCourseSchema), ctrl.updateCourse);
courseRoutes.post('/:id/enroll', requireRole('student'), ctrl.enroll);

export const adminCourseRoutes = Router();
adminCourseRoutes.use(requireAuth, requireRole('admin'));
adminCourseRoutes.get('/', ctrl.adminListCourses);
