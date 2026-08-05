import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import * as ctrl from './materials.controller';
import {
  createMaterialUploadUrlSchema,
  finalizeMaterialSchema,
  newVersionMaterialSchema,
} from './materials.schema';

export const materialRoutes = Router();

materialRoutes.use(requireAuth);

materialRoutes.post(
  '/upload-url',
  requireRole('lecturer'),
  validate(createMaterialUploadUrlSchema),
  ctrl.uploadUrl,
);
materialRoutes.post(
  '/',
  requireRole('lecturer'),
  validate(finalizeMaterialSchema),
  ctrl.finalize,
);
materialRoutes.get('/:id/download-url', requireRole('student', 'lecturer', 'admin'), ctrl.downloadUrl);
materialRoutes.post(
  '/:id/versions',
  requireRole('lecturer'),
  validate(newVersionMaterialSchema),
  ctrl.newVersion,
);
