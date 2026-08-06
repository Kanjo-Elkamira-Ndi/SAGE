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
3. The hourly reminder cron (Phase 7) emits `deadline_reminder` notifications inside the reminder window for enrolled students — reusing the existing `notifications` type with `related_entity_type = 'exam'` (no enum churn, per the exams decision).
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

**Implementation status:** implemented in `api/src/modules/performance/risk.ts` (weights/thresholds as `RISK_WEIGHTS`/`RISK_THRESHOLDS` constants, pure + unit-tested). Snapshots are recomputed best-effort whenever a grade or quiz attempt is finalized, and weekly via cron (`0 2 * * 0`). `/admin/performance/at-risk` defaults to `minScore = 0.33` (medium+) so the report lists only actionable students. Risk is *decline vs the previous snapshot*, so a student who maintains steady (even low) performance has a low score until a drop appears.

**AI step (narration only, strictly downstream of the score):**

1. Once `risk_level`/`risk_score` and the underlying factor breakdown exist for a student, the API may call Groq with that structured data to generate a short, encouraging, plain-language explanation and study suggestion.
2. Example prompt framing: *"Given this student's performance data [factors], write a brief, supportive 2–3 sentence note explaining their current standing and one concrete suggestion. Do not invent any numbers not provided."*
3. The AI output is **display-only narration** — it is never written back into `risk_score`/`risk_level`, and it is never the sole content shown (always paired with the actual chart/numbers, so the student/lecturer can verify the narration against real data).

## 7. Notification & Reminder Flow

1. Hourly cron scans `assignments`/`quizzes` with deadlines inside the reminder window (e.g. 48h and 24h and 2h before).
2. For each affected student, check `notifications_sent` for that `(user_id, event_type, event_ref_id)` — skip if already sent.
3. If not sent: write `notifications` row, insert into `notifications_sent`, optionally send email.
4. Daily cron: for each student with a recent `performance_snapshots` row, generate an AI study-plan notification per the narration step above (Section 6) — also idempotency-checked per day.

## 8. Admin Oversight Flow

1. Admin views `activity_logs`, filterable by user/action/date — used to investigate anomalies or answer "who changed X."
2. Admin manages accounts: create lecturer, deactivate student, reassign department.
3. Admin views at-risk report (`/admin/performance/at-risk`) — aggregated from the same deterministic scoring used in student-facing views, ensuring consistency between what a student sees about themselves and what an admin/lecturer sees about them.
4. Admin generates/export reports (CSV first, PDF later) for university reporting needs.

## 9. Manual Test Checklist (maintain and expand as features land)

- [x] Register → login → access role-appropriate dashboard only
- [x] Lecturer uploads material → student sees it immediately, can download
- [x] Material update → old version still accessible via history, new version marked current
- [x] Assignment submission after deadline is correctly flagged (and blocked if late not allowed)
- [x] Quiz auto-grading matches manually verified expected score
- [ ] AI-generated quiz questions require explicit lecturer approval before going live (Phase 5)
- [ ] Risk score recomputes correctly after a new grade is entered (Phase 6)
- [ ] Deadline reminder does not fire twice for the same event (Phase 7)
- [x] Admin deactivating a user immediately blocks their login
- [x] Cross-role access attempts (e.g. student hitting a lecturer-only endpoint) are rejected server-side
