# SAGE — API Implementation Plan

Execution plan for the Express API in `api/`. Build order mirrors `backend-roadmap.md`; the schema and endpoint contracts live in `database-schema.md` and `api-reference.md`. This plan is the working checklist for implementation.

## Current State

- **Phase 0 (Scaffold & Infra) — complete & verified:** build passes, `001_init.sql` migration applied (18 tables incl. `exams` + indexes), seed (4 departments + `admin@sage.app`), `/health` 200 with DB check, `/v1/ping` 200, 404 envelope, 6 vitest tests green.
- **Phase 1 (Auth & RBAC) — complete & verified:** all 7 auth endpoints implemented, migration `002_add-password-reset-tokens.sql` applied, 23 vitest tests green, full curl lifecycle (register → login → me → refresh rotation/reuse-detection → logout → forgot/reset) verified. Details in the Phase 1 section below.
- **Phase 2 (Courses, Enrollment, Materials) — complete & verified:** courses + materials modules implemented against local Postgres and live Supabase Storage (signed upload/download), 38 vitest tests green, full curl lifecycle (create course → enroll → signed upload → finalize → version bump → download, plus RBAC denials) verified end-to-end. Details in the Phase 2 section below.
- Design docs are the source of truth: `database-schema.md`, `api-reference.md`, `backend-roadmap.md`, `architecture.md`, `security.md`, `workflows.md`.
- Frontends are not wired yet: `web/src/lib/apiClient.ts` is empty; the admin console runs on mocks (`web/src/features/admin/data.ts`); `mobile/` has no HTTP layer. No Clerk anywhere — custom JWT auth per `security.md`. The auth API contract already matches the mobile `AuthRepository` / `User.fromApi` shapes and the web auth screens.

## Locked Decisions

1. **Videos**: excluded from v1. `materials.type` stays `enum('pdf','pptx','notes')`. Video (mp4/webm, transcoding, CDN) is a post-v1 extension.
2. **Exams**: a first-class `exams` entity — new table, lecturer CRUD, automated reminders in the cron. Reuses the `deadline_reminder` notification type with `related_entity_type='exam'` (no enum churn).
3. **Tests**: Vitest for pure logic (risk scoring, Zod schemas, auth/refresh helpers, cron idempotency) + Postman/curl gates per phase.
4. **Dev database**: local Postgres, managed in DBeaver. Migrations run via `node-pg-migrate` CLI; DBeaver is for inspection only, never hand-edits.
5. **Base path**: all routes mounted under `/v1` (per `api-reference.md`). Ignore the `/api/...` prefix shown in a few `architecture.md` examples — `/v1` is canonical.
6. **Auth**: custom JWT (access 15 min in-memory + rotating, hashed refresh token in `httpOnly` cookie on the API origin), per `security.md`. No Clerk.

## Requirements → Design Mapping

| Requirement | Design |
|---|---|
| Create courses, upload PDFs/PPTX/notes, update materials | `courses`, `materials` + versioning (new row, `is_current` flip, `replaces_material_id`) |
| Student: view enrolled courses, download materials, view outlines | `/courses` scoped list, `/courses/:id/materials`, signed download URLs |
| Assignments, deadlines, grading, feedback | `assignments`, `submissions`, `submission_history` |
| Quizzes, instant results, auto-grading | `quizzes`, `quiz_questions`, `quiz_attempts` — server-side grading only |
| GPA, quiz/assignment perf, charts, current vs previous | `performance_snapshots` (precomputed; diff two rows) |
| At-risk prediction | deterministic rule-based risk score (`workflows.md`), AI narration strictly downstream |
| Assignment/quiz reminders, new-material alerts, AI study reminders | `notifications`, `notifications_sent` idempotency + node-cron |
| **Examination reminders** | new `exams` table + CRUD + cron reminder |
| Admin: users, departments, activity monitor, reports, permissions | `/admin/*` endpoints, `activity_logs`, `permissions` table |

---

## Phase 0 — Scaffold & Infra

**Dependencies (prod):** `express`, `pg`, `zod`, `argon2`, `jsonwebtoken`, `cors`, `helmet`, `node-cron`, `dotenv`.
**Dependencies (dev):** `typescript`, `tsx` (dev runner), `vitest`, `node-pg-migrate`, `@types/express`, `@types/jsonwebtoken`, `@types/node`, `@types/cors`.

**Files to fill:**
- `package.json` — real scripts: `dev` (tsx watch), `build` (tsc), `start`, `test` (vitest), `migrate:up` / `migrate:down` (node-pg-migrate).
- `tsconfig.json` — strict, `module: commonjs` (matches `"type": "commonjs"`), `outDir: dist`.
- `src/config/env.ts` — zod-validated env (fail fast): `PORT`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`, plus later `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`.
- `src/config/db.ts` — `pg.Pool` from `DATABASE_URL`.
- `src/lib/logger.ts` — structured request logger.
- `src/middleware/errorHandler.ts` — centralized handler returning `{ success, error }` shape.
- `src/middleware/validate.ts` — Zod schema wrapper.
- `src/middleware/auth.ts` / `requireRole.ts` — JWT verify + role check (used from Phase 1 onward).
- `src/app.ts` — helmet, cors allowlist, `GET /health`, mount `/v1` router.
- `src/server.ts` — listen + pool connect check.

**Migrations:** `001_init.sql` (via node-pg-migrate) for all tables + indexes (see `database-schema.md`) **including new `exams` table**:

```sql
CREATE TABLE exams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     uuid NOT NULL REFERENCES courses(id),
  created_by    uuid NOT NULL REFERENCES users(id),
  title         text NOT NULL,
  scheduled_at  timestamptz NOT NULL,
  duration_minutes int,
  venue         text,
  instructions  text
);
```

Indexes: `exams(course_id)`, `exams(scheduled_at)`.

**Seed script (dev only):** departments, an admin user, sample courses.

**Gate:** `npm run build` passes; `GET /health` returns 200; migrations apply cleanly against `sage`.

## Phase 1 — Auth & RBAC — ✅ DONE

Implemented (`src/modules/auth/`):

- `auth.schema.ts` — zod: `register`, `login`, `forgotPassword`, `resetPassword`. Strong password policy (8+ chars, upper, lower, digit, symbol). Emails lowercased/trimmed; `role` defaulted to `student` on register.
- `auth.service.ts` — argon2 hashing; JWT issue (15-min access, `sub`+`role`); refresh token = random 48-byte value, **sha256 hash stored** in `refresh_tokens`; rotation + reuse detection (revoke-all-sessions on reuse → `AUTH_TOKEN_REUSED`); logout revoke; `touchLastLogin`. Public user shape joins `departments.name AS department_name` — matches mobile `User.fromApi`.
- `auth.controller.ts` / `auth.routes.ts` — `POST /auth/register|login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`. Refresh token accepted from httpOnly cookie (`path: /v1/auth`, secure in prod, sameSite lax/none), body `refreshToken`, or Bearer header. Activity logs on login/logout/failed login/register/reset.
- **Pending-approval flow:** student registrations auto-active; lecturer/admin signups created `is_active=false` and the 201 includes `pendingApproval: true`. Inactive accounts cannot log in or refresh (`USER_DEACTIVATED` 403) — admin console "pending" list backs this.
- **Password reset:** new `password_reset_tokens` table (migration `002`), 1h TTL, sha256-hashed tokens, single-use. Reset link built from `FRONTEND_URL`. Dev/test mode echoes `resetToken`/`resetLink` in the response (no SMTP yet); production sends via `lib/mailer.ts` (SMTP placeholders in `.env.example`). Reset revokes all the user's refresh sessions.
- `middleware/auth.ts` — verify Bearer, load user, reject if `is_active = false`.

**Gate (verified):** curl lifecycle all green — student register 201 (no session) / lecturer register `pendingApproval:true`; duplicate email 409 `EMAIL_TAKEN`; weak password 400 `VALIDATION_ERROR`; login 200 + `Set-Cookie` refresh; `/auth/me` 200 / 401 missing / 401 invalid; pending login 403 `USER_DEACTIVATED`; wrong password 401; refresh rotation 200; old-token reuse 401 `AUTH_TOKEN_REUSED` + all sessions revoked; logout revokes; forgot-password 200 (dev token, unknown email no-enumeration); reset-password 200 → single-use 400 `RESET_TOKEN_USED` → login with new password 200 / old password 401.

## Phase 2 — Courses, Enrollment, Materials — ✅ DONE

Implemented (`src/modules/courses/`, `src/modules/materials/`):

- **Course module:** `courses.schema.ts` (zod create/update — `code` normalized uppercase, `departmentId` uuid), `courses.service.ts` (scoped lists: student → enrolled only, lecturer → owned, admin → all via `/admin/courses`; detail + outline; ownership checks server-side; `COURSE_CODE_TAKEN` 409 on code dupes), `courses.controller.ts` / `courses.routes.ts` (routes below). Enrollment inserts an `enrollments` row (`status='active'`); re-enroll → `ALREADY_ENROLLED` 409.
- **Storage:** `src/lib/storage.ts` — signed upload/download helpers against Supabase Storage (`POST /object/upload/sign/…` for upload, `POST /object/sign/…` for download). MIME allowlist (`application/pdf`, PPTX variants, `text/markdown`, `text/plain`) mapped to `materials.type` (`pdf|pptx|notes`), 50 MB cap, random UUID key paths, service role key never leaves the server.
- **Materials:** `POST /materials/upload-url` (lecturer, verifies course ownership + mime/size), `POST /materials` finalize (verifies the object actually exists in storage before inserting the row — `MATERIAL_FILE_MISSING` otherwise), `POST /materials/:id/versions` (new row `version+1`, old row `is_current=false`, `replaces_material_id` chain, transactional), `GET /materials/:id/download-url` (enrolled student / owning lecturer / admin; short-lived signed URL). Upload flow sends the file bytes **directly from the client to Supabase** using the signed URL — bytes never pass through the API.
- **Notifications:** every material create/version emits a `new_material` notification row for all active enrolled students (lecturer name in the body). Activity logging on all mutating actions.
- **Pagination:** `src/lib/pagination.ts` — `?page=&limit=` (default 20) on all list endpoints.

**Routes:**

| Method | Endpoint | Role |
|---|---|---|
| GET | `/courses` | student (enrolled) / lecturer (owned) |
| GET | `/courses/:id` | enrolled student / owning lecturer / admin |
| POST | `/courses` | lecturer/admin |
| PATCH | `/courses/:id` | owning lecturer/admin |
| POST | `/courses/:id/enroll` | student |
| GET | `/admin/courses` | admin |
| GET | `/courses/:id/materials` | enrolled student / owning lecturer / admin |
| POST | `/materials/upload-url` | lecturer |
| POST | `/materials` | lecturer |
| POST | `/materials/:id/versions` | owning lecturer |
| GET | `/materials/:id/download-url` | enrolled student / owning lecturer / admin |

**Gate (verified):** full curl lifecycle green — lecturer creates course → student enrolls (re-enroll 409) → signed upload URL (anon-key PUT 200) → finalize 201 (bogus key 400 `MATERIAL_FILE_MISSING`) → student lists + downloads (bytes match) → new version (old row `is_current=false`, list shows only v2, v2 bytes match) → notifications/activity rows written. RBAC denials: student creates course 403 `FORBIDDEN_ROLE`, lecturer enrolls 403, non-enrolled student course detail/materials/download 403 `NOT_ENROLLED`. Cleaned up after verification (bucket + DB). Storage runs against live Supabase project `gczxybqncbqdxfzmznvg` (bucket `materials`, private).

**Deviation from the draft contract:** new-version route is `POST /materials/:id/versions` (not `PATCH /materials/:id`) since a version is a *new row*, not a field update — `api-reference.md` and `workflows.md` updated to match. Download URL access extended to owning lecturers/admins.

## Phase 3 — Assignments, Exams & Submissions

- Assignment CRUD: `GET /courses/:id/assignments`, `POST /assignments`, `PATCH /assignments/:id`.
- **Exam CRUD:** `GET /courses/:id/exams`, `POST /exams`, `PATCH /exams/:id` (owning lecturer/admin).
- Submissions: `POST /submissions/upload-url` (checks enrollment + deadline, sets `is_late`), `POST /submissions` (finalize; UNIQUE per student; resubmit appends `submission_history`), `GET /assignments/:id/submissions` (lecturer), `PATCH /submissions/:id/grade` (score + feedback → `feedback` notification).

**Gate:** late flag correct; submission blocked after deadline when late disallowed; grade triggers student notification.

## Phase 4 — Quizzes

- Quiz CRUD + questions: `GET /courses/:id/quizzes`, `POST /quizzes`, `PATCH /quizzes/:id`.
- Attempts: `POST /quizzes/:id/start` (window + `time_limit_minutes` check against `started_at`), `POST /quizzes/:id/submit` — **server-side grading** against `correct_answer` (never trust client scores), `GET /quizzes/:id/results` (own result).

**Gate:** auto-graded score matches manually verified expected score; availability window enforced server-side.

## Phase 5 — Groq AI Quiz Generation

- `src/lib/groq.ts` — single wrapper, key server-side only.
- `POST /quizzes/generate` — extract text from a material (PDF parsing lib), prompt Groq with strict JSON-schema instructions, validate/parse with zod, return **draft questions for lecturer review**. Never auto-publish; publish only via `PATCH /quizzes/:id` after explicit approval, set `ai_generated = true`.
- Rate-limit this endpoint (Groq calls cost money).

**Needs from user:** Groq API key.
**Gate:** generate → review → edit → publish flow; malformed AI output is rejected/retried, never shown raw.

## Phase 6 — Performance Tracking

- `performance_snapshots` table (already in `001_init.sql`).
- Pure, unit-tested risk module implementing the `workflows.md` formula (weighted GPA trend, missed-submission rate, quiz decline, engagement; thresholds 0.66/0.33). **Vitest unit tests.**
- Snapshot triggers: weekly cron + on-demand recompute after a grade is finalized.
- Endpoints: `GET /performance/me`, `GET /performance/me/risk`, `GET /performance/course/:id` (lecturer), `GET /admin/performance/at-risk` (admin/lecturer).
- AI narration of risk (plain-language explanation) is **display-only**, never written back into scores.

**Gate:** risk-score unit tests pass; snapshot diff gives a clean current-vs-previous comparison.

## Phase 7 — Notifications & Cron

- `src/jobs/scheduler.ts` + jobs: `deadlineReminders.job.ts`, `studyPlan.job.ts`, `performanceSnapshot.job.ts`.
- Hourly: scan `assignments`, `quizzes`, and **`exams`** for deadlines in the reminder window (48h / 24h / 2h); write `notifications` rows + `notifications_sent` (UNIQUE `user_id, event_type, event_ref_id`) to prevent duplicates.
- Daily: personalized AI study-plan notifications from latest `performance_snapshots` (Groq narration), idempotency-checked per day.
- Announcements: `POST /announcements` (course-scoped or system-wide), `GET /notifications` (paginated), `PATCH /notifications/:id/read`.

**Gate:** a reminder never fires twice for the same event; reminders fire within the window for all three entity types.

## Phase 8 — Admin Module

Response shapes matched to the admin console mocks (`web/src/features/admin/data.ts`) so the mock → API swap is drop-in.

- `GET/POST /admin/users`, `PATCH/DELETE /admin/users/:id` (role change, deactivate/soft delete).
- `GET/POST /admin/departments`.
- `GET /admin/courses` (all courses, any department).
- `GET /admin/activity-logs` (filters: user, action, date range).
- `GET /admin/reports/overview` (user counts, course counts, submission rates) + `GET /admin/reports/export` (CSV first, PDF later).
- `GET /admin/performance/at-risk` (from Phase 6 — same deterministic scoring as student-facing views).
- `permissions` table wired for any beyond-role access control if needed.

**Gate:** admin flows pass against the same shapes the admin console already renders.

## Phase 9 — Hardening

- Rate limiting (`express-rate-limit`) on `/auth/login`, `/auth/register`, `/quizzes/generate` (e.g. 10 req/15 min per IP on auth).
- Full validation audit — zod schemas on every body, no unchecked inputs.
- `npm audit` clean; security.md pre-launch checklist verified.
- Load-check the notification cron against realistic enrollment volume.

**Gate:** `security.md` §10 checklist all green.

---

## Cross-Cutting (apply throughout)

- Every mutating endpoint writes an `activity_logs` entry.
- Enrollment/ownership checked **server-side** on every gated resource — never rely on hidden UI.
- Consistent `{ success, data }` / `{ success, error }` response shape from Phase 0.
- All list endpoints support `?page=&limit=` (default `limit=20`).
- File bytes never pass through the API — always the signed-URL pattern.
- All SQL parameterized (`$1, $2…`); no string-concatenated queries.

## Test Strategy

- **Vitest unit tests** for pure logic: risk scoring, Zod schemas, auth/refresh helpers, cron idempotency, signed-URL builders. Located alongside modules (`*.test.ts`).
- **Postman/curl gates** per phase (listed above) for endpoint-level verification.

## Environment & Prerequisites

`api/.env` (git-ignored) — `.env.example` holds placeholders only:

```env
PORT=4000
DATABASE_URL=postgresql://postgresql:codex4587@localhost:5432/sage
JWT_ACCESS_SECRET=<random>
JWT_REFRESH_SECRET=<random distinct>
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
FRONTEND_URL=http://localhost:5173
# SMTP_HOST=                  # needed before production password-reset emails
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASS=
# SMTP_FROM=SAGE <no-reply@sage.app>
SUPABASE_URL=https://<project-ref>.supabase.co   # used since Phase 2 (Storage)
SUPABASE_ANON_KEY=<publishable key>              # safe for frontends
SUPABASE_SERVICE_ROLE_KEY=<secret key>           # server-side ONLY
SUPABASE_STORAGE_BUCKET=materials
# GROQ_API_KEY=               # needed Phase 5 (AI)
```

## Milestones

- **M1** = Phases 0–4 (student/lecturer core: auth, courses, materials, assignments/exams, quizzes)
- **M2** = Phases 5–7 (AI quiz generation, performance tracking, notifications)
- **M3** = Phases 8–9 (admin module + hardening)

## Post-v1 Backlog

- Video materials (transcoding, CDN, storage cost review).
- PDF report export (after CSV).
- BullMQ + Redis if AI workloads grow.
- Cloudflare R2 if file volume outgrows Supabase Storage.
