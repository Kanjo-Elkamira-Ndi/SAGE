# SAGE — End-to-End Workflows

## 1. Student Onboarding & Course Access

1. Student registers (`/auth/register`) → account created with role `student`.
2. Student browses available courses (or is enrolled by admin/lecturer in a controlled-enrollment model — confirm with client which model applies) and enrolls.
3. Student lands on course detail page → sees outline, materials list, assignments, quizzes.
4. Student downloads a material → frontend requests a signed download URL from the API (which checks enrollment) → fetches directly from Supabase Storage.

## 2. Lecturer Publishes Material (with Versioning)

1. Lecturer uploads a new PDF for an existing course topic.
2. Frontend requests signed upload URL → uploads directly to Supabase Storage.
3. Frontend finalizes via `POST /materials` (first version) or `POST /materials/:id/versions` (new version of existing material).
4. On update: API inserts a new `materials` row with `version + 1`, sets prior row `is_current = false`, links via `replaces_material_id`.
5. API creates a `new_material` notification for all enrolled students.

## 3. Assignment Lifecycle

1. Lecturer creates assignment with deadline.
2. Students see it in their assignment list with a countdown/urgency indicator.
3. Student submits (signed upload URL → finalize). API checks: enrolled? before deadline (or late allowed)? Marks `is_late` accordingly.
4. Lecturer reviews submissions list, grades + writes feedback.
5. API triggers a `feedback` notification to the student.
6. Grade feeds into the next `performance_snapshots` computation for that student.

## 4. Quiz Lifecycle (Manual)

1. Lecturer builds quiz manually: title, questions (MCQ/true-false), correct answers, availability window.
2. Student starts attempt within the window → `quiz_attempts` row created with `started_at`.
3. Student submits answers → **server** grades against `quiz_questions.correct_answer` (never trust a client-computed score), stores `score` and `answers`.
4. Student sees instant result screen.
5. Score feeds into performance snapshot computation.

## 4a. Exam Lifecycle

1. Lecturer schedules an exam: title, `scheduled_at`, optional duration/venue/instructions.
2. Students see it in the course exam list.
3. The hourly reminder cron (Phase 7) emits `deadline_reminder` notifications inside the reminder window for enrolled students of **assignments** with `allow_late_submission = false` — reusing the existing `notifications` type with `related_entity_type = 'assignment'` (no enum churn). Quiz/exam reminders are a future extension of the same scan.
4. Exam execution itself is offline/room-based in v1 — the API tracks the schedule, not the sitting.

## 5. Quiz Lifecycle (AI-Assisted Generation) — Division of Labor

This is the workflow where the AI/deterministic boundary matters most. Follow this exactly:

1. Lecturer selects a material (lecture notes/PDF) and requests AI-assisted quiz generation.
2. **Deterministic step**: API extracts plain text from the material (PDF text extraction library — not Groq).
3. **AI step**: API sends the extracted text to Groq with a strict system prompt requiring structured JSON output (question, type, options, correct_answer, points) — use Groq's JSON mode or tool-calling to enforce shape, not a "please respond in JSON" hope.
4. **Deterministic step**: API validates the returned JSON against a schema (Zod) before showing it to the lecturer. Malformed or incomplete output is rejected/retried, never shown raw.
5. Draft questions are shown to the lecturer for review/edit — **this is a mandatory human checkpoint.** Nothing from `/quizzes/generate` is published as a live quiz automatically.
6. Lecturer edits/approves → quiz saved with `ai_generated = true` for transparency (visible to admin/lecturer, not necessarily to students, unless the client wants that disclosed).

## 6. Performance Tracking & At-Risk Prediction — Division of Labor

This is the other critical AI/deterministic boundary. The client asked for "predict students who may be at risk" — this must be implemented as a **rule-based scoring model**, not an LLM call, for accuracy and explainability.

**Deterministic risk score (computed in application/SQL logic):**

Example formula (tune weights with real data once available, but keep the *structure* — weighted, explainable factors, not a black box):

```
risk_score =
    0.35 * normalized(GPA_trend_decline)         // negative slope over last N snapshots
  + 0.25 * normalized(missed_submission_rate)     // assignments not submitted / total assigned
  + 0.25 * normalized(quiz_score_decline)         // recent quiz avg vs prior quiz avg
  + 0.15 * normalized(low_engagement_signal)      // e.g. days since last material access, if tracked

risk_level =
    'high'   if risk_score >= 0.66
    'medium' if risk_score >= 0.33
    'low'    otherwise
```

- This computation is pure code (or SQL), unit-tested, and stored in `performance_snapshots`. It must be reproducible and explainable — if a lecturer asks "why is this student flagged," the answer should be a breakdown of the four factors above, not "the model decided."

**Implementation status:** implemented in `api/src/modules/performance/risk.ts` (weights/thresholds as `RISK_WEIGHTS`/`RISK_THRESHOLDS` constants, pure + unit-tested). Snapshots are recomputed best-effort whenever a grade or quiz attempt is finalized, and weekly via cron (`0 2 * * 0`). `/admin/reports/at-risk` defaults to `minScore = 0.33` (medium+) so the report lists only actionable students. Risk is *decline vs the previous snapshot*, so a student who maintains steady (even low) performance has a low score until a drop appears.

**AI step (narration only, strictly downstream of the score):**

1. Once `risk_level`/`risk_score` and the underlying factor breakdown exist for a student, the API may call Groq with that structured data to generate a short, encouraging, plain-language explanation and study suggestion.
2. Example prompt framing: *"Given this student's performance data [factors], write a brief, supportive 2–3 sentence note explaining their current standing and one concrete suggestion. Do not invent any numbers not provided."*
3. The AI output is **display-only narration** — it is never written back into `risk_score`/`risk_level`, and it is never the sole content shown (always paired with the actual chart/numbers, so the student/lecturer can verify the narration against real data).

## 7. Notification & Reminder Flow

**Implemented (Phase 7 ✅).** Four scheduled jobs run via `node-cron` in `src/jobs/scheduler.ts` (`startScheduler()` → `{stop}`, disabled in tests). Every job is wrapped in a guard that logs-and-swallows so one failure never kills the scheduler. Idempotency: each notification goes through `sendIdempotentNotification`, which writes `notifications_sent` (UNIQUE `user_id, event_type, event_ref_id`) **in the same transaction** as the `notifications` row; a rerun finds the guard and skips.

1. **Hourly** (`5 * * * *`, `deadlineReminders.job`): scans `assignments` with `allow_late_submission = false` and no submission yet, for active enrolled students, due within each window in `DEADLINE_REMINDER_WINDOWS` (default `48,24,2` hours). Emits one `deadline_reminder` per `(student, assignment, windowHours)` — so a student can get a 2-day, 1-day, and 2-hour notice for the same deadline. Event ref key: `{studentId}:{assignmentId}:{hours}h`.
2. **Daily 21:00** (`materialDigest.job`): groups materials uploaded in the last 24h by course, sends each active enrolled student a `new_material` digest listing them (key: `{studentId}:{dateKey}`).
3. **Daily 05:00** (`studyPlan.job`): per student, gathers their courses + 5 nearest upcoming deadlines, calls Groq for a short supportive study plan (sanitized to 4000 chars), writes an `ai_study_plan` notification (key: `{studentId}:{dateKey}`). Students with no courses/deadlines, or when Groq is unavailable, are **skipped** — the job never fails the run.
4. Announcements notify their audience immediately (all active users for school-wide; the course's active enrolled students when `courseId` is set) as `announcement` notifications.

## 8. Admin Oversight Flow

1. Admin views `activity_logs` (`/admin/activity-logs`, filterable by user/action), used to investigate anomalies or answer "who changed X."
2. Admin manages accounts (`/admin/users`): list with `role`/`status`/`q` filters, activate pending lecturers (pending accounts get `USER_PENDING_APPROVAL` on login until then), deactivate, change roles (self-actions blocked).
3. Admin views `/admin/dashboard/stats` (counts, pending approvals, at-risk summary, 14-day enrollment retention) and the at-risk report (`/admin/reports/at-risk`) — aggregated from the same deterministic scoring used in student-facing views, ensuring consistency between what a student sees about themselves and what an admin/lecturer sees about them.
4. Admin exports the at-risk report as CSV (`/admin/reports/at-risk/export`). PDF export is deferred (post-v1 backlog).
5. Admin manages departments (`/admin/departments`; unique code) and per-user permissions (`/admin/users/:id/permissions`).

## 9. Manual Test Checklist (maintain and expand as features land)

- [x] Register → login → access role-appropriate dashboard only
- [x] Lecturer uploads material → student sees it immediately, can download
- [x] Material update → old version still accessible via history, new version marked current
- [x] Assignment submission after deadline is correctly flagged (and blocked if late not allowed)
- [x] Quiz auto-grading matches manually verified expected score
- [x] AI-generated quiz questions require explicit lecturer approval before going live (Phase 5)
- [x] Risk score recomputes correctly after a new grade is entered (Phase 6)
- [x] Deadline reminder does not fire twice for the same event (Phase 7)
- [x] New-material digest and study-plan notifications are idempotent per day (Phase 7)
- [x] Course-scoped announcement notifies only that course's enrolled students (Phase 7)
- [x] Admin deactivating a user immediately blocks their login
- [x] Pending lecturer/admin login is blocked with `USER_PENDING_APPROVAL` until activation (Phase 8)
- [x] Cross-role access attempts (e.g. student hitting a lecturer-only endpoint) are rejected server-side
