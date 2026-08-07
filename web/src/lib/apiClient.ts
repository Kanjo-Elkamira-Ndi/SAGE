/**
 * SAGE web API client — the single place the browser talks to the Express API.
 *
 * Contract (docs/api-wiring-plan.md §0):
 * - Base URL: `VITE_SAGE_API_URL` (default `http://localhost:4000/v1`).
 * - Access token is held in memory ONLY (never localStorage — docs/security.md).
 * - All requests send `Authorization: Bearer <accessToken>` + `credentials` so
 *   the httpOnly `refresh_token` cookie travels with cross-origin requests.
 * - On `401 AUTH_TOKEN_EXPIRED` → `POST /auth/refresh` once → retry the request.
 * - `401 AUTH_TOKEN_REUSED` → tokens were rotated/stolen → force logout.
 * - Envelope is unwrapped here: callers get `data` directly or a thrown
 *   `SageApiError` / `SageNetworkError`.
 */

export interface SageApiErrorShape {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export class SageApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(
    code: string,
    message: string,
    status: number,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "SageApiError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export class SageNetworkError extends Error {
  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : "Network request failed");
    this.name = "SageNetworkError";
  }
}

/* ---------- Base URL & in-memory session ---------- */

const DEFAULT_BASE_URL = "http://localhost:4000/v1";

export const BASE_URL: string =
  (import.meta.env.VITE_SAGE_API_URL as string | undefined) ?? DEFAULT_BASE_URL;

let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;
let onSessionExpired: (reason: string) => void = () => {};

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Called when the session can no longer be trusted (reuse detected / refresh failed). */
export function setSessionExpiredHandler(handler: (reason: string) => void): void {
  onSessionExpired = handler;
}

function forceLogout(reason: "token-reused" | "refresh-failed"): void {
  accessToken = null;
  onSessionExpired(reason);
}

/* ---------- Request plumbing ---------- */

export interface ApiRequestInit {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

async function parseErrorBody(res: Response): Promise<SageApiError> {
  let code = "HTTP_ERROR";
  let message = res.statusText || `Request failed (${res.status})`;
  let fieldErrors: Record<string, string[]> | undefined;
  try {
    const body = (await res.json()) as { error?: SageApiErrorShape } | null;
    if (body?.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      fieldErrors = body.error.fieldErrors;
    }
  } catch {
    /* non-JSON body — keep defaults */
  }
  return new SageApiError(code, message, res.status, fieldErrors);
}

/** POST /auth/refresh (cookie-authenticated). Rotates the token; returns the new access token or null. */
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      let res: Response;
      try {
        res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
      } catch {
        return null;
      }
      if (!res.ok) return null;
      try {
        const body = (await res.json()) as {
          success?: boolean;
          data?: { accessToken?: string };
        } | null;
        if (body?.success && body.data?.accessToken) {
          accessToken = body.data.accessToken;
          return accessToken;
        }
      } catch {
        /* ignore */
      }
      return null;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  init: ApiRequestInit = {},
  retried = false,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: init.method ?? "GET",
      headers: buildHeaders(),
      credentials: "include",
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: init.signal,
    });
  } catch (err) {
    throw new SageNetworkError(err);
  }

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const error = await parseErrorBody(res);
    if (res.status === 401 && error.code === "AUTH_TOKEN_EXPIRED" && !retried) {
      const fresh = await refreshAccessToken();
      if (fresh) return apiFetch<T>(path, init, true);
      forceLogout("refresh-failed");
      throw error;
    }
    if (error.code === "AUTH_TOKEN_REUSED") {
      forceLogout("token-reused");
      throw error;
    }
    throw error;
  }

  try {
    const body = (await res.json()) as ApiEnvelope<T> | null;
    if (body && body.success === true) return body.data;
  } catch {
    /* fall through */
  }
  throw await parseErrorBody(res);
}

async function apiFetchBlob(path: string, retried = false): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: buildHeaders(),
      credentials: "include",
    });
  } catch (err) {
    throw new SageNetworkError(err);
  }
  if (res.ok) return res.blob();

  const error = await parseErrorBody(res);
  if (res.status === 401 && error.code === "AUTH_TOKEN_EXPIRED" && !retried) {
    const fresh = await refreshAccessToken();
    if (fresh) return apiFetchBlob(path, true);
    forceLogout("refresh-failed");
    throw error;
  }
  if (error.code === "AUTH_TOKEN_REUSED") {
    forceLogout("token-reused");
    throw error;
  }
  throw error;
}

/** Fetch a binary response (e.g. CSV export) and save it as a file download. */
export async function downloadBlob(path: string, filename: string): Promise<void> {
  const blob = await apiFetchBlob(path);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/* ---------- Auth helpers (docs/api-wiring-plan.md §0.2) ---------- */

export interface AuthUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  departmentName: string | null;
}

export interface LoginResult {
  accessToken: string;
  user: AuthUserPayload;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const data = await apiFetch<LoginResult>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  accessToken = data.accessToken;
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<{ loggedOut: boolean }>("/auth/logout", { method: "POST" });
  } finally {
    accessToken = null;
  }
}

export async function getMe(): Promise<AuthUserPayload> {
  const data = await apiFetch<{ user: AuthUserPayload }>("/auth/me");
  return data.user;
}
