# SAGE — Security

## 1. Authentication

- **JWT access + refresh token pattern** (chosen specifically because frontend and backend are on different origins — Vercel vs Render/Railway — which makes cross-origin cookie handling more fragile than header-based tokens).
- Access token: short-lived (15 min), sent as `Authorization: Bearer <token>`, held in memory on the frontend (not `localStorage`, to reduce XSS exfiltration risk).
- Refresh token: longer-lived (7–30 days), stored `httpOnly`, `Secure`, `SameSite=None` cookie scoped to the API domain, **hashed** before storing server-side in `refresh_tokens` so a DB leak doesn't hand out usable tokens.
- Refresh rotation: every refresh call issues a new refresh token and revokes the old one (detect reuse of a revoked token as a signal of possible theft → revoke all sessions for that user).
- Passwords hashed with argon2id (or bcrypt, cost factor ≥ 12) — never stored or logged in plaintext.

## 2. Authorization (RBAC)

- Three base roles: `student`, `lecturer`, `admin`. Enforced server-side on **every** route via `requireRole(...)` middleware — this is the actual security boundary, not frontend route guards.
- Ownership checks beyond role (e.g. "is this lecturer the owner of this course," "is this student enrolled in this course") happen in the service layer, not just the route middleware.
- `permissions` table exists for future fine-grained control (e.g. a lecturer granted admin-lite course-approval rights) — not required for v1 role logic, just don't design against it existing.
- Admin actions that change access (deactivate user, change role) are logged to `activity_logs` with the acting admin's ID.

## 3. Data Protection

- All traffic HTTPS only (enforced by Vercel and Render/Railway by default — verify no plain-HTTP fallback in CORS/redirect config).
- Supabase Storage buckets are **private** by default. All file access — upload and download — goes through short-lived signed URLs issued by the API after an authorization check. Nothing is publicly listable or guessable.
- Signed URL expiry: short (minutes) for downloads, just long enough for the actual upload/download to complete — not hours.
- PII minimization: only store what's needed (name, email, role, department). No storing of national ID numbers, addresses, or other sensitive personal data unless the client explicitly requires it later.

## 4. Input Validation & Injection Prevention

- Every request body validated with Zod before it reaches business logic — reject early with `VALIDATION_ERROR`, don't let malformed data reach the query layer.
- All SQL parameterized (`$1, $2...`) via `pg` — no string concatenation of user input into queries, ever, including in ad-hoc admin/report queries.
- File upload validation: check MIME type and extension against an allowlist (`pdf`, `pptx`, `ppt`, plain text/markdown for notes) both client-side (UX) and server-side (actual enforcement) before issuing a signed upload URL.
- File size limits enforced server-side when generating the signed upload URL (Supabase Storage policies + application-level check).

## 5. Secrets Management

| Secret | Where it lives | Never |
|---|---|---|
| `DATABASE_URL` (Supabase) | API env only | In frontend, in git, in logs |
| `GROQ_API_KEY` | API env only | Frontend never calls Groq directly |
| `SUPABASE_SERVICE_ROLE_KEY` | API env only | This key bypasses RLS — treat as a master key, API-only |
| `SUPABASE_ANON_KEY` | Frontend env (safe, public by design) | Still don't misuse it to bypass API authorization logic |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | API env only, distinct values | Reused between environments |

- `.env` files git-ignored in both apps; `.env.example` committed with placeholder values and comments only.
- Rotate JWT secrets and Groq key if ever accidentally exposed (git history, logs, screenshots during demos).

## 6. CORS

- API allows only known origins: local dev URL, Vercel preview pattern (or a specific allowlist of preview URLs if wildcard is too permissive), and the production frontend domain.
- Credentials (`Access-Control-Allow-Credentials: true`) enabled since the refresh-token cookie crosses origins — pair this carefully with an explicit (not wildcard `*`) origin allowlist, since wildcard + credentials is invalid and a common misconfiguration.

## 7. Rate Limiting & Abuse Prevention

- Auth endpoints (`/auth/login`, `/auth/register`) rate-limited per IP (e.g. 10 requests/15 min) to blunt credential-stuffing/brute-force attempts.
- Quiz submission endpoint checks `started_at` server-side against `time_limit_minutes` — never trust a client-reported elapsed time.
- Consider basic per-user rate limiting on the AI quiz-generation endpoint (Groq calls cost money and can be abused if left unbounded).

## 8. Audit & Monitoring

- `activity_logs` captures: auth events (login/logout/failed login), all create/update/delete on courses/materials/assignments/quizzes/users, all admin actions.
- Review logs periodically for anomalies (e.g. one account downloading materials from courses it isn't enrolled in — should be structurally impossible given RBAC, but the log is the trip-wire if a bug slips through).

## 9. AI-Specific Considerations

- Groq calls from the backend must not include more student data than the task needs (e.g. quiz generation only needs the material's text content, not the requesting student's personal data; study-plan generation needs performance numbers but not, say, other students' data for comparison beyond aggregate/anonymized class average).
- AI-generated content (quiz questions, study plans) is never auto-published without a human (lecturer, or the system's own deterministic check) in the loop — see `workflows.md`.
- Log which model/prompt version generated AI content (useful both for debugging and if a client ever asks "why did the AI suggest this").

## 10. Pre-Launch Checklist

- [x] All endpoints behind `requireRole` where appropriate — audited in Phase 9; every mutating endpoint also validates its body with a Zod schema (no unchecked bodies)
- [x] No secrets in git history — only `.env.example` (placeholders) committed; verified with a secret-pattern scan of HEAD
- [x] CORS allowlist confirmed — explicit origin list from `CORS_ORIGINS`; **confirm the production frontend domain is added before launch** (current default is localhost only)
- [x] Signed URL expiry times reviewed — downloads default 5 min (server-internal extraction uses 60 s), uploads 2 h (just enough for large uploads), sizes capped (materials 50 MB, submissions 100 MB)
- [x] Rate limiting active on auth routes — `AUTH_RATE_LIMIT_MAX` (default 10) per IP per `AUTH_RATE_LIMIT_WINDOW_MS` (default 15 min) on login/register/forgot-password/reset-password; quiz generation rate-limited separately (6/min); all via the shared `apiRateLimit` factory
- [x] Refresh token rotation + reuse detection tested — rotation + all-sessions revoke on reuse since Phase 1
- [x] Activity logging confirmed on all sensitive actions — auth, course/material/assignment/quiz mutations, announcements, and all admin actions (Phase 8); `activity_logs` query endpoint for admin
- [x] Dependency audit (`npm audit`) run on both apps — **api: 0 vulnerabilities; web: 2 high (react-router)** — both are the RSC-mode CSRF advisory (GHSA-qwww-vcr4-c8h2); the web app is a Vite SPA with client-side routing (no React Server Components), so the advisory does not apply to its usage. The only available "fix" is a breaking downgrade to react-router-dom@7.11.0, which is not worth taking for an inapplicable advisory — re-check when an upstream fixed release exists.

### Notes on remaining items
- Quiz submission time limits are enforced **server-side** from `quiz_attempts.started_at` (never client-reported elapsed time) — see `quizzes.service.ts`.
- A load check of the hourly deadline-reminder cron against realistic volume (1,000 students → 3,000 notifications) completes in ~2.5 s thanks to the batched idempotent-send path; a re-run sends 0 duplicates.
