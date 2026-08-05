import type { Request, Response } from 'express';
import { paramString } from '../../lib/params';
import * as materialService from './materials.service';
import type {
  CreateMaterialUploadUrlInput,
  FinalizeMaterialInput,
  NewVersionMaterialInput,
} from './materials.schema';

export async function uploadUrl(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateMaterialUploadUrlInput;
  const result = await materialService.createUploadUrl(body, req.user!.id);
  res.json({ success: true, data: result });
}

export async function finalize(req: Request, res: Response): Promise<void> {
  const body = req.body as FinalizeMaterialInput;
  const material = await materialService.finalizeMaterial(body, req.user!.id);
  res.status(201).json({ success: true, data: { material } });
}

export async function newVersion(req: Request, res: Response): Promise<void> {
  const body = req.body as NewVersionMaterialInput;
  const material = await materialService.addNewVersion(paramString(req.params.id), body, req.user!.id);
  res.status(201).json({ success: true, data: { material } });
}

export async function downloadUrl(req: Request, res: Response): Promise<void> {
  const result = await materialService.downloadUrl(paramString(req.params.id), req.user!);
  res.json({ success: true, data: result });
}
