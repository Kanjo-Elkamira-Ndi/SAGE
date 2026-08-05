import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import * as ctrl from './assignments.controller';
import {
  createAssignmentSchema,
  createSubmissionUploadUrlSchema,
  finalizeSubmissionSchema,
  gradeSubmissionSchema,
  updateAssignmentSchema,
} from './assignments.schema';

export const assignmentRoutes = Router();

assignmentRoutes.use(requireAuth);

assignmentRoutes.post('/', requireRole('lecturer'), validate(createAssignmentSchema), ctrl.createAssignment);
assignmentRoutes.patch('/:id', requireRole('lecturer'), validate(updateAssignmentSchema), ctrl.updateAssignment);
assignmentRoutes.get('/:id/submissions', requireRole('lecturer'), ctrl.listSubmissions);

export const submissionRoutes = Router();

submissionRoutes.use(requireAuth);

submissionRoutes.post(
  '/upload-url',
  requireRole('student'),
  validate(createSubmissionUploadUrlSchema),
  ctrl.submissionUploadUrl,
);
submissionRoutes.post('/', requireRole('student'), validate(finalizeSubmissionSchema), ctrl.finalizeSubmission);
submissionRoutes.get('/:id/download-url', requireRole('student', 'lecturer', 'admin'), ctrl.downloadSubmission);
submissionRoutes.patch('/:id/grade', requireRole('lecturer'), validate(gradeSubmissionSchema), ctrl.gradeSubmission);
