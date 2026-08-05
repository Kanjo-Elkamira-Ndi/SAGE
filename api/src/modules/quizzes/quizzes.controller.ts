import type { Request, Response } from 'express';
import { paramString } from '../../lib/params';
import * as quizService from './quizzes.service';
import type { CreateQuizInput, SubmitQuizInput, UpdateQuizInput } from './quizzes.schema';

export async function createQuiz(req: Request, res: Response): Promise<void> {
  const quiz = await quizService.createQuiz(req.body as CreateQuizInput, req.user!.id);
  res.status(201).json({ success: true, data: { quiz } });
}

export async function updateQuiz(req: Request, res: Response): Promise<void> {
  const quiz = await quizService.updateQuiz(
    paramString(req.params.id),
    req.body as UpdateQuizInput,
    req.user!.id,
  );
  res.json({ success: true, data: { quiz } });
}

export async function startAttempt(req: Request, res: Response): Promise<void> {
  const result = await quizService.startAttempt(paramString(req.params.id), req.user!.id);
  res.status(201).json({ success: true, data: result });
}

export async function submitAttempt(req: Request, res: Response): Promise<void> {
  const result = await quizService.submitAttempt(
    paramString(req.params.id),
    req.user!.id,
    req.body as SubmitQuizInput,
  );
  res.json({ success: true, data: result });
}

export async function results(req: Request, res: Response): Promise<void> {
  const result = await quizService.getResults(paramString(req.params.id), req.user!.id);
  res.json({ success: true, data: result });
}

export async function listCourseQuizzes(req: Request, res: Response): Promise<void> {
  const items = await quizService.listQuizzesForCourse(paramString(req.params.id), req.user!);
  res.json({ success: true, data: { courseId: req.params.id, quizzes: items } });
}
