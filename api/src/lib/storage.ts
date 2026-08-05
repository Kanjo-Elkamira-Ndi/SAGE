import { env } from '../config/env';
import { AppError } from './errors';

export type MaterialType = 'pdf' | 'pptx' | 'notes';

export const MAX_MATERIAL_BYTES = 50 * 1024 * 1024; // 50 MB

export const DEFAULT_DOWNLOAD_URL_TTL_SECONDS = 300; // 5 minutes

const MIME_TO_TYPE: Record<string, MaterialType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint': 'pptx',
  'text/markdown': 'notes',
  'text/plain': 'notes',
};

export const ALLOWED_MATERIAL_MIME_TYPES = Object.keys(MIME_TO_TYPE);

export function materialTypeFromMime(contentType: string): MaterialType | null {
  return MIME_TO_TYPE[contentType.split(';')[0].trim().toLowerCase()] ?? null;
}

export function fileExtensionForType(type: MaterialType): string {
  switch (type) {
    case 'pdf':
      return 'pdf';
    case 'pptx':
      return 'pptx';
    case 'notes':
      return 'md';
  }
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'file'
  );
}

export function buildStorageKey(courseId: string, fileName: string, type: MaterialType): string {
  const uuid = crypto.randomUUID();
  return `${courseId}/${uuid}-${slugify(fileName)}.${fileExtensionForType(type)}`;
}

function requireStorageConfig(): string {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError(
      'STORAGE_NOT_CONFIGURED',
      'Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      503,
    );
  }
  return `${env.SUPABASE_URL}/storage/v1`;
}

const STORAGE_HEADERS = (): Record<string, string> => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY as string,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY as string}`,
});

function encodePath(path: string): string {
  return path
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

async function storageRequest(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const base = requireStorageConfig();
  const headers: Record<string, string> = {
    ...STORAGE_HEADERS(),
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  if (init.json !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { ok: res.ok, status: res.status, body };
}

export interface UploadUrlResult {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
}

/**
 * Issues a signed upload URL for a single material file. The client PUTs the
 * bytes directly to Supabase using the returned URL (authorized by its token —
 * the service role key never leaves the server).
 */
export async function createMaterialUploadUrl(input: {
  courseId: string;
  contentType: string;
  fileSizeBytes: number;
  fileName: string;
}): Promise<UploadUrlResult> {
  const type = materialTypeFromMime(input.contentType);
  if (!type) {
    throw new AppError(
      'UNSUPPORTED_FILE_TYPE',
      `File type not allowed. Supported: ${ALLOWED_MATERIAL_MIME_TYPES.join(', ')}.`,
      400,
    );
  }
  if (input.fileSizeBytes > MAX_MATERIAL_BYTES) {
    throw new AppError('FILE_TOO_LARGE', 'File exceeds the 50 MB limit.', 400);
  }

  const storageKey = buildStorageKey(input.courseId, input.fileName, type);
  const { ok, status, body } = await storageRequest(
    `/object/upload/sign/${env.SUPABASE_STORAGE_BUCKET}/${encodePath(storageKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': input.contentType,
        'Content-Length': String(input.fileSizeBytes),
      },
    },
  );

  if (!ok) {
    throw new AppError(
      'STORAGE_SIGN_FAILED',
      'Could not create an upload URL.',
      status >= 500 ? 502 : 400,
      body,
    );
  }
  const uploadUrl = (body as { url?: string }).url;
  if (!uploadUrl) {
    throw new AppError('STORAGE_SIGN_FAILED', 'Storage returned no upload URL.', 502, body);
  }
  return {
    uploadUrl: `${env.SUPABASE_URL as string}${uploadUrl.startsWith('/storage') ? '' : '/storage/v1'}${uploadUrl}`,
    storageKey,
    expiresInSeconds: 7200,
  };
}

/**
 * Issues a short-lived signed download URL for a stored material.
 */
export async function createMaterialDownloadUrl(
  storageKey: string,
  expiresInSeconds = DEFAULT_DOWNLOAD_URL_TTL_SECONDS,
): Promise<{ downloadUrl: string; expiresInSeconds: number }> {
  const { ok, status, body } = await storageRequest(
    `/object/sign/${env.SUPABASE_STORAGE_BUCKET}/${encodePath(storageKey)}`,
    { method: 'POST', json: { expiresIn: expiresInSeconds } },
  );

  if (!ok) {
    throw new AppError('STORAGE_SIGN_FAILED', 'Could not create a download URL.', status >= 500 ? 502 : 400, body);
  }
  const signedURL = (body as { signedURL?: string }).signedURL;
  if (!signedURL) {
    throw new AppError('STORAGE_SIGN_FAILED', 'Storage returned no download URL.', 502, body);
  }
  return { downloadUrl: `${env.SUPABASE_URL as string}/storage/v1${signedURL}`, expiresInSeconds };
}

/**
 * Verifies that an object actually exists in storage (used when finalizing a
 * material record so the DB never references a missing file).
 */
export async function objectExists(storageKey: string): Promise<boolean> {
  const { ok } = await storageRequest(
    `/object/info/${env.SUPABASE_STORAGE_BUCKET}/${encodePath(storageKey)}`,
    { method: 'GET' },
  );
  return ok;
}
