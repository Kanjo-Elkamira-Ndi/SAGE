import type { Request, Response } from 'express';
import { paramString } from '../../lib/params';
import * as examService from './exams.service';
import type { CreateExamInput, UpdateExamInput } from './exams.schema';

export async function createExam(req: Request, res: Response): Promise<void> {
  const exam = await examService.createExam(req.body as CreateExamInput, req.user!.id);
  res.status(201).json({ success: true, data: { exam } });
}

export async function updateExam(req: Request, res: Response): Promise<void> {
  const exam = await examService.updateExam(
    paramString(req.params.id),
    req.body as UpdateExamInput,
    req.user!.id,
  );
  res.json({ success: true, data: { exam } });
}

export async function listCourseExams(req: Request, res: Response): Promise<void> {
  const items = await examService.listExamsForCourse(paramString(req.params.id), req.user!);
  res.json({ success: true, data: { courseId: req.params.id, exams: items } });
}
