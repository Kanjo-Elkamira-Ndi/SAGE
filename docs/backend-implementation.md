# SAGE — API Implementation Plan

Execution plan for the Express API in `api/`. Build order mirrors `backend-roadmap.md`; the schema and endpoint contracts live in `database-schema.md` and `api-reference.md`. This plan is the working checklist for implementation.

## Current State

- **Phase 0 (Scaffold & Infra) — complete & verified:** build passes, `001_init.sql` migration applied (18 tables incl. `exams` + indexes), seed (4 departments + `admin@sage.app`), `/health` 200 with DB check, `/v1/ping` 200, 404 envelope, 6 vitest tests green.
- **Phase 1 (Auth & RBAC) — complete & verified:** all 7 auth endpoints implemented, migration `002_add-password-reset-tokens.sql` applied, 23 vitest tests green, full curl lifecycle (register → login → me → refresh rotation/reuse-detection → logout → forgot/reset) verified. Details in the Phase 1 section below.
- **Phase 2 (Courses, Enrollment, Materials) — complete & verified:** courses + materials modules implemented against local Postgres and live Supabase Storage (signed upload/download), 38 vitest tests green, full curl lifecycle (create course → enroll → signed upload → finalize → version bump → download, plus RBAC denials) verified end-to-end. Details in the Phase 2 section below.
- **Phase 3 (Assignments, Exams, Submissions) — complete & verified:** assignments + submissions + exams modules implemented, 62 vitest tests green, full curl lifecycle (create → signed upload → finalize → resubmit/history → grade + `feedback` notification; deadline enforcement incl. late-allowed vs `DEADLINE_PASSED`; exam CRUD; cross-lecturer `NOT_COURSE_OWNER` denials; submission download) verified end-to-end. Details in the Phase 3 section below.
- **Phase 4 (Quizzes) — complete & verified:** quizzes module with server-side auto-grading implemented, 62 vitest tests green, full curl lifecycle (create MCQ + true/false → start returns question IDs without answers → submit scored 3/3 and 0/5 correctly → results breakdown; window checks `QUIZ_NOT_AVAILABLE`/`QUIZ_CLOSED`; single-attempt `QUIZ_ALREADY_ATTEMPTED`; RBAC denials) verified end-to-end. Details in the Phase 4 section below.
- **Phase 5 (Groq AI Quiz Generation) — complete & verified:** `POST /quizzes/generate` implemented (text extraction from notes/PDF materials, strict JSON-schema prompting + zod validation with alias normalization, draft-only — never auto-publishes), `ai_generated` column persisted, rate-limited, 108 vitest tests green, full curl lifecycle incl. a real Groq call verified. Details in the Phase 5 section below.
- **Phase 6 (Performance Tracking) — complete & verified:** rule-based risk scoring (`risk.ts`, exact `workflows.md` formula, unit-tested), snapshot recompute on grade/quiz triggers (advisory-locked upsert, no duplicates), weekly cron, `/performance/*` + `/admin/performance/*` endpoints, 108 vitest tests green, curl E2E verified. Details in the Phase 6 section below.
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

## Phase 3 — Assignments, Exams & Submissions — ✅ DONE

Implemented (`src/modules/assignments/`, `src/modules/exams/`):

- **Assignments:** `assignments.schema.ts` (create/update — `maxScore` coerced + capped at 1000, `deadlineAt` ISO datetime, `allowLateSubmission` default false), `assignments.service.ts` (`createAssignment` rejects past deadlines `DEADLINE_PAST`; `updateAssignment` partial; `listAssignmentsForCourse` course-scoped with per-student `mySubmission` subquery; ownership via `requireLecturerOwns`), `assignments.routes.ts` below.
- **Submissions:** `createSubmissionUploadUrl` (enrollment + deadline check via `assertNotPastDeadline`, `isLate` computed; storage `createSubmissionUploadUrl` caps at 100 MB, any doc type), `finalizeSubmission` (verifies object exists — `SUBMISSION_FILE_MISSING` — then upsert `ON CONFLICT (assignment_id, student_id) DO UPDATE` + `submission_history` row; `attempts` counter; resubmit after deadline blocked when late disallowed), `gradeSubmission` (`SCORE_EXCEEDS_MAX` guard; writes score/feedback/gradedBy and a `feedback` notification), `listSubmissionsForAssignment` (owning lecturer only), `submissionDownloadUrl` (student owner / owning lecturer / admin).
- **Exams:** `exams.schema.ts` (create/update — `scheduledAt` ISO, optional `durationMinutes`/`venue`/`instructions`), `exams.service.ts` (course-scoped list, create/update with ownership), routes below.
- **Shared access helpers added to `courses.service.ts`:** `requireStudentEnrolled`, `requireLecturerOwns`, `requireCourseReadAccess` (used across phases 3–4).

**Routes:**

| Method | Endpoint | Role |
|---|---|---|
| GET | `/courses/:id/assignments` | enrolled student / owning lecturer / admin |
| POST | `/assignments` | owning lecturer |
| PATCH | `/assignments/:id` | owning lecturer |
| GET | `/assignments/:id/submissions` | owning lecturer |
| POST | `/submissions/upload-url` | enrolled student |
| POST | `/submissions` | enrolled student |
| PATCH | `/submissions/:id/grade` | owning lecturer |
| GET | `/submissions/:id/download-url` | student owner / owning lecturer / admin |
| GET | `/courses/:id/exams` | enrolled student / owning lecturer / admin |
| POST | `/exams` | owning lecturer |
| PATCH | `/exams/:id` | owning lecturer |

**Gate (verified):** create → upload-url (on-time, `isLate:false`) → signed PUT → finalize 201 → resubmit bumps `attempts` to 2 + history row → grade 45/50 with feedback → `feedback` notification for the student (body: *"graded "DSA Homework 1". You scored 45/50."*); past-deadline + late-disallowed submit 403 `DEADLINE_PASSED`; past-deadline + late-allowed submit accepted with `isLate:true` and graded; cross-lecturer list/grade 403 `NOT_COURSE_OWNER`; download URL for owner + lecturer 200. 

**Deviation from the draft contract:** grade route is `PATCH /submissions/:id/grade` (not `/assignments/:id/submissions/:sid/grade`) — `api-reference.md` updated to match. Submission download access extended to the owning lecturer/admin.

## Phase 4 — Quizzes — ✅ DONE

Implemented (`src/modules/quizzes/`):

- **Schema:** `quizzes.schema.ts` — quiz create/update (`timeLimitMinutes` 1–600 nullable, optional `availableFrom`/`availableUntil`), nested `questionSchema` (mcq with 2–6 `options` + `correctAnswer` must be one of them; true/false `correctAnswer` must be `true`/`false` case-insensitive via `superRefine`; 1–100 questions). `submitQuizSchema` requires ≥1 `{ questionId, answer }`.
- **Service:** `createQuiz`/`updateQuiz` (transactional question replace; `INVALID_WINDOW` if `availableUntil ≤ availableFrom`; ownership), `listQuizzesForCourse` (per-student best-score subquery), `startAttempt` (`QUIZ_NOT_AVAILABLE` / `QUIZ_CLOSED` window checks; single in-progress attempt per student; returns question IDs **without** correct answers), `submitAttempt` (**server-side grading** — score computed from `correct_answer`, never from the client; `QUIZ_ALREADY_ATTEMPTED`, `QUIZ_TIME_EXPIRED` auto-submit with elapsed check, `INVALID_QUESTION` guard; answer normalization trims + lowercases true/false; returns `score/total/correctCount/perQuestionResults` with correct answers), `getResults` (own graded attempt or `QUIZ_NOT_TAKEN`).
- **Routes:** `POST /quizzes`, `PATCH /quizzes/:id` (owning lecturer), `POST /quizzes/:id/start`, `POST /quizzes/:id/submit`, `GET /quizzes/:id/results` (student).

**Gate (verified):** create MCQ + true/false quiz → start (questions without answers) → submit correct answers → score 3/3, per-question `correct:true`; fresh quiz with all-wrong answers → score 0/5, `correct:false` + correct answers revealed; results endpoint shows full breakdown; future-window start 403 `QUIZ_NOT_AVAILABLE`; past-window start 403 `QUIZ_CLOSED`; second start after submit 409 `QUIZ_ALREADY_ATTEMPTED`; student create 403 `FORBIDDEN_ROLE`, lecturer start 403 `FORBIDDEN_ROLE`; `GET /courses/:id/quizzes` lists with `questionCount`. 62 vitest tests green (schema tests for all three modules added).

## Phase 5 — Groq AI Quiz Generation — ✅ DONE

Implemented (`src/lib/groq.ts`, `src/lib/material-text.ts`, `src/modules/quizzes/`):

- **Groq client** (`src/lib/groq.ts`): thin `groqChat()` wrapper (base URL `https://api.groq.com/openai/v1`). API key read live from `process.env.GROQ_API_KEY` — never leaves the server; throws `GROQ_UNAVAILABLE` 503 when unset, 502 on Groq API failure. `GROQ_QUIZ_SYSTEM_PROMPT` enforces a strict JSON schema. Model default `openai/gpt-oss-20b` (native schema adherence); `GROQ_MAX_TOKENS` / `GROQ_TEMPERATURE` configurable via env.
- **Text extraction** (`src/lib/material-text.ts`): `extractTextFromMaterial(type, bytes)` — `notes` decoded as UTF-8, `pdf` parsed via `pdf-parse` (v1.1.1, saved as an optional dep), `pptx` returns `MATERIAL_TYPE_UNSUPPORTED`. `truncateText()` caps LLM context at `MAX_MATERIAL_TEXT_CHARS` (default 15000). Raw bytes fetched server-side via new `storage.downloadObjectBytes()` (signed download URL → fetch).
- **Generation endpoint** `POST /quizzes/generate` (lecturer, ownership-checked): resolves material by `materialId` or the latest current material in the course, extracts + truncates text, prompts Groq in `json_object` mode, then **validates the draft with zod** before returning. A retry loop (2 attempts) feeds the schema errors back to the model. `normalizeGroqDraft()` maps common LLM key aliases (`question`/`answer` → `questionText`/`correctAnswer`, infers `mcq`/`true_false` from options presence, resolves numeric answer indexes, defaults `points`) so the endpoint is robust across models. Invalid output → `AI_OUTPUT_INVALID` 502 — never shown raw.
- **Draft-only, never auto-publish:** returns `{ questions, source: { materialId, materialTitle, materialType, textChars }, aiGenerated: true, note }` and saves nothing. Lecturers publish via `POST /quizzes` / `PATCH /quizzes/:id` with `aiGenerated: true` (new column on `quizzes`, persisted in create + update).
- **Rate limiting:** `express-rate-limit` on the route (60s window, `QUIZ_GENERATE_MAX_PER_MINUTE` default 6) → 429 `TOO_MANY_REQUESTS`.

**Gate (verified):** real Groq call via curl — create course → signed notes-material upload → finalize → `POST /quizzes/generate` returned 5 validated questions (`source.materialType: "notes"`, `aiGenerated: true`); published via `POST /quizzes` with `aiGenerated:true` (flag persisted); `PATCH` preserved it; student start/submit worked; RBAC denials (student cannot generate); 429 observed after 7 rapid calls. Groq key lives in local `api/.env` (git-ignored).

## Phase 6 — Performance Tracking — ✅ DONE

Implemented (`src/modules/performance/`):

- **Pure risk module** (`risk.ts`): `computeRiskScore` / `riskLevelFromScore` / `explainRisk` implementing the exact `workflows.md` formula — `0.35·gpaDecline + 0.25·missedSubmissionRate + 0.25·quizDecline + 0.15·lowEngagement`, thresholds high ≥ 0.66 / medium ≥ 0.33 — as `RISK_WEIGHTS` / `RISK_THRESHOLDS` constants. Fully unit-tested (`risk.test.ts`).
- **Service** (`performance.service.ts`): `computeStudentMetrics` (GPA = average scored % across graded assignments + quiz attempts; per-course aggregates incl. `missedSubmissionRate`), `buildRiskFactors` (decline vs the previous snapshot), snapshot lifecycle — `recomputeOne` recomputes the overall + course snapshot for a student in one transaction and upserts via **DELETE+INSERT keyed on `(student_id, course_id, snapshot_date)` guarded by a Postgres advisory lock**, so concurrent grade/quiz triggers cannot create duplicate rows. Triggers: `recomputeStudentSnapshotsForGrade` fire-and-forget (`void`) from `assignments.gradeSubmission` and `quizzes.submitAttempt`; best-effort, failures logged as `performance.snapshot.recompute_failed`.
- **Endpoints:** `GET /performance/me` (student — overall snapshot + metrics), `GET /performance/me/risk` (student — factor breakdown, score, level, last snapshot date), `GET /performance/courses/:id` (lecturer — course averages + per-student rows with risk), `GET /admin/reports/at-risk` (admin — latest overall snapshot per student; default `minScore` = the medium threshold 0.33 so the report only surfaces actionable students; `?minScore=` / `?level=` overrides), `POST /admin/performance/recompute-snapshots` (admin — one-off full or per-course recompute).
- **Weekly cron** (`src/jobs/scheduler.ts`): `node-cron` `0 2 * * 0` (Sunday 02:00) recomputes all snapshots; scheduler disabled in the test env, started from `server.ts`.
- Plain-language risk narration remains **display-only and downstream** of the score per `workflows.md`; the Groq call for it is deferred to the Phase 7 study-plan job.

**Gate (verified):** curl E2E — AI-generated + published quiz, student submitted (scored), submitted + got an assignment graded 85 → async recompute fired → `/performance/me` showed GPA 60 / assignment 85 / quiz 10; `/performance/me/risk` returned breakdown + level; lecturer `/performance/courses/:id` listed the student with risk; admin `/admin/performance/at-risk` returned the student (risk 0.365 → medium); all RBAC denials 403/401; no duplicate snapshot keys. 108 vitest tests green.

**Deviation from the draft contract:** course-performance route is `/performance/courses/:id` (plural) and at-risk is admin-only (draft said `/performance/course/:id`, `admin/lecturer`) — `api-reference.md` updated to match.

## Phase 7 — Notifications & Cron ✅ DONE

- `src/jobs/scheduler.ts` (`startScheduler()` → `{stop}`, disabled in test env) + jobs: `deadlineReminders.job.ts`, `materialDigest.job.ts`, `studyPlan.job.ts`, `performanceSnapshot.job.ts`. Every job is wrapped in a `guard()` that logs and swallows errors so one failure never kills the scheduler.
- **Hourly** (`5 * * * *`): `deadlineReminders` scans `assignments` where `allow_late_submission = false`, not yet submitted (NOT EXISTS submission), joined to active enrolled students, due within each window of `DEADLINE_REMINDER_WINDOWS` (default `48,24,2` hours). Writes a `deadline_reminder` notification per `studentId:assignmentId:{hours}h` via `sendIdempotentNotification`, which inserts `notifications_sent` (UNIQUE `user_id, event_type, event_ref_id`) **in the same transaction** — a rerun returns `false` and notifies nothing.
- **Daily 21:00** (`0 21 * * *`): `materialDigest` groups the last-24h materials (`is_current = true`) by course and sends one `new_material` digest per active enrolled student who has new material, idempotency-keyed by `studentId:{dateKey}`.
- **Daily 05:00** (`0 5 * * *`): `studyPlan` builds a prompt per student from their courses + 5 nearest deadlines, calls Groq (`openai/gpt-oss-20b`; `maxTokens: 1000, temperature: 0.5` — the model is a reasoning model and returned empty `content` at 300 tokens, so keep the ceiling generous), sanitizes to 4000 chars, writes an `ai_study_plan` notification idempotent per `studentId:{dateKey}`. Groq-unavailable / no-deadlines / no-courses students are **skipped**, never fail the job.
- **Weekly Sunday 02:00** (`0 2 * * 0`): `performanceSnapshot` wraps `recomputeAllSnapshots(now)`.
- Announcements module: `POST /announcements` (create; `courseId` optional → school-wide when absent), `GET /announcements` (paginated list with author/course join), `PATCH /announcements/:id`, `DELETE /announcements/:id`. Create auto-notifies the audience — all active users (school-wide) or the course's active enrolled students (`related_entity_type='announcement'`, `related_entity_id=announcementId`, `::uuid` cast in the `INSERT…SELECT` so param typing is explicit). Lecturers may only post/update courses they own (`courses.lecturer_id`); delete is admin-only. Create/update/delete write `announcement_*` activity logs.
- Notifications module: `GET /notifications` (paginated, `?isRead=&type=` filters, returns `{ items, total, unread }`), `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`. Pagination offset is `(page-1)*limit`.
- Live-user notifications (announcements, and any future event) write directly; cron-generated ones go through `sendIdempotentNotification`. `uuidFromString(s)` derives a stable, collision-free uuid from any string (sha-256 → v5 shape) for idempotency keys.
- Auth change: `users.activated_at` added (migration `1786021449085_add-users-activated-at`). Students register self-activated (`is_active=true` + `activated_at=now()`); lecturer/admin signups register **pending** (`is_active=false`, `activated_at=null`) and get `USER_PENDING_APPROVAL` on login until an admin activates them. `requireAuth` and `authenticate()` distinguish pending vs deactivated (`activated_at` set → deactivated).

**Gate (verified):** dry-run of every job twice — deadline reminders `{windows:[48,24,2], candidates:3, sent:3}` then `sent:0` on rerun; material digest `sent:1` then 0; study plan `generated:1` then 0; snapshot recompute `processed:1`. E2E: announcement to school notified all active users; course-scoped announcement notified only the 1 enrolled student; `GET /notifications` filters (`isRead`, `type`), read + read-all verified. A reminder never fires twice for the same event.

## Phase 8 — Admin Module ✅ DONE

Admin console routes all gated by `requireAuth` + `requireRole('admin')`. Response shapes matched to the admin console mocks (`web/src/features/admin/data.ts`) so the mock → API swap is drop-in.

- `GET /admin/users` (`?page=&limit=&role=&status=active|pending|deactivated&q=`; returns `{ users, total, pendingCount }`), `PATCH /admin/users/:id/status` (activate/deactivate; self-deactivation → `VALIDATION_ERROR`; activation stamps `activated_at`), `PATCH /admin/users/:id/role` (self-change blocked), `GET /admin/users/:id/permissions`, `POST /admin/users/:id/permissions` (grant, `ON CONFLICT DO NOTHING`), `DELETE /admin/users/:id/permissions` (revoke).
- `GET /admin/departments` (with lecturer counts), `POST /admin/departments` (unique `code`, 409 `DEPARTMENT_CODE_TAKEN`), `PATCH /admin/departments/:id`.
- `GET /admin/activity-logs` (`?user=&action=&limit=`, returns recent-first rows with actor/course join).
- `GET /admin/dashboard/stats` (student/lecturer/course/enrollment counts, pending lecturers, announcement count, at-risk summary, 14-day enrollment retention series, 10 recent activity rows).
- `GET /admin/reports/at-risk` (`?minScore=&level=`; default `minScore=0.33` so only actionable students surface) + `GET /admin/reports/at-risk/export` (`text/csv`, `Content-Disposition` attachment, `lib/csv.ts`).
- `POST /admin/performance/recompute-snapshots` (optional `{courseId}` → per-course recompute, else full).
- `permissions` table wired: per-user grants + coarse role→permission map in `middleware/requirePermission.ts` (`users:manage` → admin; `announcements:manage` → admin/lecturer; etc.).

**Gate (verified):** E2E — pending lecturer blocked (`USER_PENDING_APPROVAL`), admin activation stamps `activatedAt`, self-deactivation rejected, student→admin endpoints 403 `FORBIDDEN_ROLE`, user list filters, department create/409/update, permission grant/list/revoke, activity-log filters, dashboard stats, at-risk report + CSV export. All 22 vitest files / 146 tests green; `tsc` clean.

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
GROQ_API_KEY=               # server-side ONLY (Phase 5+); key lives in api/.env, never committed
GROQ_MODEL=openai/gpt-oss-20b   # default; llama-3.3-70b-versatile works via normalization too
GROQ_MAX_TOKENS=2048
GROQ_TEMPERATURE=0.7
QUIZ_GENERATE_MAX_PER_MINUTE=6
MAX_MATERIAL_TEXT_CHARS=15000
DEADLINE_REMINDER_WINDOWS=48,24,2   # Phase 7 hourly reminder windows (hours before deadline)
```

## Milestones

- **M1** = Phases 0–4 (student/lecturer core: auth, courses, materials, assignments/exams, quizzes) — ✅ complete
- **M2** = Phases 5–7 (AI quiz generation, performance tracking, notifications) — ✅ complete
- **M3** = Phases 8–9 (admin module + hardening) — Phase 8 ✅ complete; Phase 9 next

## Post-v1 Backlog

- Video materials (transcoding, CDN, storage cost review).
- PDF report export (after CSV).
- BullMQ + Redis if AI workloads grow.
- Cloudflare R2 if file volume outgrows Supabase Storage.
