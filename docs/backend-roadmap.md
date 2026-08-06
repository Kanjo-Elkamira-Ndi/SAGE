# SAGE — Backend Roadmap (Express API)

Each phase should end in something testable via Postman/curl before moving to the next. Do not start Phase N+1 with Phase N's endpoints unverified.

## Phase 0 — Project Setup
- Initialize TypeScript Express project, `pg` pool config against Supabase connection string.
- Env config loader + validation (fail fast if required vars missing).
- Base middleware: JSON parsing, CORS (allow only known frontend origins), request logging, centralized error handler returning the standard `{success, error}` shape.
- Health check endpoint `GET /health`.

## Phase 1 — Auth & RBAC
- `users`, `departments`, `refresh_tokens` tables + migration.
- Register/login/refresh/logout endpoints.
- Password hashing (argon2/bcrypt).
- JWT issuing (short-lived access token, longer-lived refresh token, refresh token hash stored in DB for revocation).
- Role-check middleware (`requireRole('lecturer','admin')`) and ownership-check helpers.
- `GET /auth/me`.

## Phase 2 — Courses, Enrollment, Materials
- `courses`, `enrollments`, `materials` tables.
- Course CRUD (lecturer/admin scoped).
- Enrollment endpoint.
- Supabase Storage integration: signed upload URL generation, signed download URL generation.
- Material finalize endpoint + versioning logic (new row on update, `is_current` flip).
- Activity log writes on create/update actions.

## Phase 3 — Assignments & Submissions
- `assignments`, `submissions`, `submission_history` tables.
- Assignment CRUD.
- Submission upload-url + finalize flow, deadline/enrollment checks, late-submission flagging.
- Grading endpoint (score + feedback), triggers a `feedback` notification.

## Phase 4 — Quizzes
- `quizzes`, `quiz_questions`, `quiz_attempts` tables.
- Manual quiz/question CRUD.
- Attempt start/submit flow with **server-side auto-grading** (never trust client-submitted scores).
- Time-limit enforcement (`available_from`/`available_until`, optional `time_limit_minutes` check against `started_at`).

## Phase 5 — Groq AI Integration (Quiz Generation) — ✅ DONE
- Groq client wrapper (`api/src/lib/groq.ts`), key stored server-side only (live `process.env` read).
- `POST /quizzes/generate`: extract text from a material (PDF parsing lib + notes; PPTX unsupported), prompt Groq with strict JSON-schema instructions, validate/parse response (with alias normalization), return draft questions for lecturer review — **never auto-publish AI-generated questions without lecturer confirmation**.
- Mark quiz `ai_generated = true` for transparency (create + update).
- Rate-limited (`express-rate-limit`, 6/min default). Verified end-to-end with a real Groq call.

## Phase 6 — Performance Tracking — ✅ DONE
- `performance_snapshots` table (in `001_init.sql`).
- Computation job: GPA (graded assignments + quiz attempts), per-course averages, decline vs previous snapshot.
- Rule-based risk scoring function (see `workflows.md` for the exact formula) — pure application logic (`risk.ts`), unit-testable, no AI involved.
- Endpoints: `/performance/me`, `/performance/me/risk`, `/performance/courses/:id` (note plural), `/admin/performance/at-risk`, plus `/admin/performance/recompute-snapshots`.
- Snapshot generation triggered: (a) weekly cron, (b) on-demand recompute after a grade is finalized for that student (also on quiz submit). Advisory-locked upsert prevents duplicate rows.

## Phase 7 — Notifications & Cron Jobs ✅ DONE
- `notifications`, `notifications_sent`, `announcements` tables.
- Notifications module (`/notifications`): list with `isRead`/`type` filters + pagination, mark-one-read, mark-all-read. Unread count returned with every list.
- Cron idempotency: `notifications_sent` guard rows (`UNIQUE user_id, event_type, event_ref_id`), written in the same transaction as the notification. Event keys derived from content via `uuidFromString()` (deterministic sha-256 → v5-shaped uuid), so rerunning a job never double-notifies.
- `node-cron` schedules (all in `src/jobs/scheduler.ts`, `startScheduler()` returns `{stop}`):
  - `5 * * * *` — `deadlineReminders.job`: scans assignments with `allow_late_submission = false` not yet submitted, due within each window (default `48,24,2` hours, env `DEADLINE_REMINDER_WINDOWS`).
  - `0 21 * * *` — `materialDigest.job`: daily per-student "new materials" digest for materials uploaded in the last 24h to their courses.
  - `0 5 * * *` — `studyPlan.job`: personalized AI study plan per student from their course list + 5 nearest deadlines via a Groq call, written as an `ai_study_plan` notification. Groq unavailable/no-courses students are skipped, never fails the job.
  - `0 2 * * 0` — `performanceSnapshot.job`: weekly full recompute (wraps `recomputeAllSnapshots`).
- Announcement endpoints: create (school-wide or course-scoped; auto-notifies audience — all active users, or the course's active enrolled students), list, update, delete. Lecturers may only post to courses they own.
- Notification list/read endpoints.
- Live-user notifications are written directly; cron notifications go through `sendIdempotentNotification`.

## Phase 8 — Admin Module ✅ DONE
- User management endpoints (`/admin/users`): list with `role`/`status` (active|pending|deactivated)/`q` filters, activate/deactivate (self-deactivation blocked), role change (self-change blocked). Pending = `is_active=false AND activated_at IS NULL` (migration `add-users-activated-at`); deactivated = `is_active=false AND activated_at IS NOT NULL`. New lecturer/admin signups register pending and cannot log in until activated (`USER_PENDING_APPROVAL`).
- Department management endpoints: list (with lecturer counts), create (unique `code`, 409 on conflict), update.
- `activity_logs` query endpoint with filters (user, action ILIKE).
- Reporting endpoints: `/admin/dashboard/stats` (overview counts + at-risk summary + 14-day enrollment retention + recent activity), `/admin/reports/at-risk` (snapshot-driven, `minScore`/`level` filters), `/admin/reports/at-risk/export` (CSV, `lib/csv.ts`).
- Permissions table wiring: per-user grant/revoke/list (`permissions`), plus a coarse role→permission map (`middleware/requirePermission.ts`) for future use.
- All admin routes gated by `requireRole('admin')`.

## Phase 9 — Hardening
- Rate limiting on auth endpoints.
- Input validation audit across all endpoints (Zod schemas everywhere, no unchecked bodies).
- Load-test the notification cron against realistic enrollment volume.
- Review all endpoints against `security.md` checklist before considering v1 "done."

## Cross-Cutting (apply throughout, not a separate phase)
- Every mutating endpoint writes an `activity_logs` entry.
- Every endpoint touching enrollment-gated resources checks enrollment/ownership server-side — never trust the frontend to have hidden a button.
- Consistent error shape from Phase 0 onward — don't retrofit later.
