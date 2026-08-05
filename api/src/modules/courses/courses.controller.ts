import type { Request, Response } from 'express';
import { AppError } from '../../lib/errors';
import { paramString } from '../../lib/params';
import { parsePagination } from '../../lib/pagination';
import { listMaterialsForCourse } from '../materials/materials.service';
import * as courseService from './courses.service';
import type { CreateCourseInput, UpdateCourseInput } from './courses.schema';

export async function listCourses(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { page, limit } = parsePagination(req.query);
  const result =
    user.role === 'student'
      ? await courseService.listCoursesForStudent(user.id, page, limit)
      : await courseService.listCoursesForLecturer(user.id, page, limit);
  res.json({ success: true, data: result });
}

export async function getCourseById(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const course = await courseService.getCourseOrThrow(paramString(req.params.id));
  if (!(await courseService.canAccessCourse(user, course))) {
    throw user.role === 'student'
      ? new AppError('NOT_ENROLLED', 'You are not enrolled in this course.', 403)
      : new AppError('NOT_COURSE_OWNER', 'You do not have access to this course.', 403);
  }
  res.json({ success: true, data: { course } });
}

export async function createCourse(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateCourseInput;
  const course = await courseService.createCourse(body, { id: req.user!.id, role: req.user!.role });
  res.status(201).json({ success: true, data: { course } });
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
  const body = req.body as UpdateCourseInput;
  const course = await courseService.updateCourse(paramString(req.params.id), body, {
    id: req.user!.id,
    role: req.user!.role,
  });
  res.json({ success: true, data: { course } });
}

export async function enroll(req: Request, res: Response): Promise<void> {
  const course = await courseService.enrollStudent(paramString(req.params.id), req.user!.id);
  res.status(201).json({ success: true, data: { course } });
}

export async function adminListCourses(req: Request, res: Response): Promise<void> {
  const { page, limit } = parsePagination(req.query);
  const result = await courseService.listAllCourses(page, limit);
  res.json({ success: true, data: result });
}

export async function listCourseMaterials(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const course = await courseService.getCourseOrThrow(paramString(req.params.id));
  if (!(await courseService.canAccessCourse(user, course))) {
    throw user.role === 'student'
      ? new AppError('NOT_ENROLLED', 'You are not enrolled in this course.', 403)
      : new AppError('NOT_COURSE_OWNER', 'You do not have access to this course.', 403);
  }
  const materials = await listMaterialsForCourse(course.id);
  res.json({ success: true, data: { courseId: course.id, materials } });
}
