import type { Request, Response } from 'express';
import { paramString } from '../../lib/params';
import * as assignmentService from './assignments.service';
import type {
  CreateAssignmentInput,
  CreateSubmissionUploadUrlInput,
  FinalizeSubmissionInput,
  GradeSubmissionInput,
  UpdateAssignmentInput,
} from './assignments.schema';

export async function createAssignment(req: Request, res: Response): Promise<void> {
  const assignment = await assignmentService.createAssignment(
    req.body as CreateAssignmentInput,
    req.user!.id,
  );
  res.status(201).json({ success: true, data: { assignment } });
}

export async function updateAssignment(req: Request, res: Response): Promise<void> {
  const assignment = await assignmentService.updateAssignment(
    paramString(req.params.id),
    req.body as UpdateAssignmentInput,
    req.user!.id,
  );
  res.json({ success: true, data: { assignment } });
}

export async function listSubmissions(req: Request, res: Response): Promise<void> {
  const result = await assignmentService.listSubmissionsForAssignment(
    paramString(req.params.id),
    req.user!.id,
  );
  res.json({ success: true, data: result });
}

export async function submissionUploadUrl(req: Request, res: Response): Promise<void> {
  const result = await assignmentService.createSubmissionUploadUrl(
    req.body as CreateSubmissionUploadUrlInput,
    req.user!.id,
  );
  res.json({ success: true, data: result });
}

export async function finalizeSubmission(req: Request, res: Response): Promise<void> {
  const submission = await assignmentService.finalizeSubmission(
    req.body as FinalizeSubmissionInput,
    req.user!.id,
  );
  res.status(201).json({ success: true, data: { submission } });
}

export async function gradeSubmission(req: Request, res: Response): Promise<void> {
  const submission = await assignmentService.gradeSubmission(
    paramString(req.params.id),
    req.body as GradeSubmissionInput,
    req.user!.id,
  );
  res.json({ success: true, data: { submission } });
}

export async function downloadSubmission(req: Request, res: Response): Promise<void> {
  const result = await assignmentService.submissionDownloadUrl(paramString(req.params.id), req.user!);
  res.json({ success: true, data: result });
}

export async function listCourseAssignments(req: Request, res: Response): Promise<void> {
  const items = await assignmentService.listAssignmentsForCourse(
    paramString(req.params.id),
    req.user!,
  );
  res.json({ success: true, data: { courseId: req.params.id, assignments: items } });
}
