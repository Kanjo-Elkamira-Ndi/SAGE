import type { Request, Response } from 'express';
import { paramString } from '../../lib/params';
import * as performanceService from './performance.service';
import type { RiskLevel } from './risk';

export async function me(req: Request, res: Response): Promise<void> {
  const data = await performanceService.getStudentPerformance(req.user!.id);
  res.json({ success: true, data });
}

export async function myRisk(req: Request, res: Response): Promise<void> {
  const data = await performanceService.getStudentRisk(req.user!.id);
  res.json({ success: true, data });
}

export async function coursePerformance(req: Request, res: Response): Promise<void> {
  const data = await performanceService.getCoursePerformance(paramString(req.params.id), req.user!.id);
  res.json({ success: true, data });
}

export async function atRisk(req: Request, res: Response): Promise<void> {
  const level = (req.query.level as string | undefined) as RiskLevel | undefined;
  const minScore = req.query.minScore ? Number(req.query.minScore) : undefined;
  const students = await performanceService.getAtRiskStudents({ level, minScore });
  res.json({ success: true, data: { students } });
}

export async function recomputeSnapshots(req: Request, res: Response): Promise<void> {
  // Triggers a one-off recompute for all enrolled students (used by the weekly cron
  // and for manual admin recomputation). Done best-effort; results vary by the
  // current DB state.
  const courseId = req.query.courseId ? paramString(req.query.courseId as string) : undefined;
  if (courseId) {
    await performanceService.recomputeCourseSnapshots(courseId);
  } else {
    await performanceService.recomputeAllSnapshots();
  }
  res.json({ success: true, data: { ok: true } });
}
