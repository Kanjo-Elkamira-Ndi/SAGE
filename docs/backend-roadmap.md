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

## Phase 5 — Groq AI Integration (Quiz Generation)
- Groq client wrapper (single module, `apps/api/src/lib/groq.ts`), key stored server-side only.
- `POST /quizzes/generate`: extract text from a material (PDF parsing lib), prompt Groq with strict JSON-schema instructions, validate/parse response, return draft questions for lecturer review — **never auto-publish AI-generated questions without lecturer confirmation**.
- Mark quiz `ai_generated = true` for transparency.

## Phase 6 — Performance Tracking
- `performance_snapshots` table.
- Computation job: GPA (from graded assignments + quizzes, weighted per course credit units), per-course averages, trend vs previous snapshot.
- Rule-based risk scoring function (see `workflows.md` for the exact formula) — pure application logic, unit-testable, no AI involved.
- Endpoints: `/performance/me`, `/performance/me/risk`, `/performance/course/:id`, `/admin/performance/at-risk`.
- Snapshot generation triggered: (a) weekly cron, (b) on-demand recompute after a grade is finalized for that student.

## Phase 7 — Notifications & Cron Jobs
- `notifications`, `notifications_sent`, `announcements` tables.
- `node-cron` schedules:
  - Hourly: deadline reminder scan (assignments/quizzes/exams within reminder window).
  - Daily: new-material digest, personalized AI study plan generation (pulls latest performance snapshot per student, Groq call to phrase a short recommendation, writes as notification).
- Announcement endpoints (course-scoped and system-wide).
- Notification list/read endpoints.

## Phase 8 — Admin Module
- User/department management endpoints (create lecturer/admin, deactivate, role change).
- `activity_logs` query endpoint with filters (user, action, date range).
- Reporting endpoints (`/admin/reports/overview`, `/admin/reports/export`) — start with overview stats (user counts, course counts, submission rates), CSV export before PDF export.
- Permissions table wiring for any beyond-role-based access control needed.

## Phase 9 — Hardening
- Rate limiting on auth endpoints.
- Input validation audit across all endpoints (Zod schemas everywhere, no unchecked bodies).
- Load-test the notification cron against realistic enrollment volume.
- Review all endpoints against `security.md` checklist before considering v1 "done."

## Cross-Cutting (apply throughout, not a separate phase)
- Every mutating endpoint writes an `activity_logs` entry.
- Every endpoint touching enrollment-gated resources checks enrollment/ownership server-side — never trust the frontend to have hidden a button.
- Consistent error shape from Phase 0 onward — don't retrofit later.
