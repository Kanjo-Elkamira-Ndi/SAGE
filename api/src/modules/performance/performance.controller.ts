import type { Request, Response } from 'express';
import { paramString } from '../../lib/params';
import * as performanceService from './performance.service';

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
