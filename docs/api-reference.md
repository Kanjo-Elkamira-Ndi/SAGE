# SAGE — API Reference

Base URL: `https://api.sage.app/v1` (placeholder — replace with actual Render/Railway URL)

All endpoints except `/auth/*` and public marketing endpoints require:
```
Authorization: Bearer <access_token>
```

All responses follow:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "STRING_CODE", "message": "Human readable" } }
```

---

## Auth

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Register. Students self-activate; lecturer/admin signups are created inactive (`pendingApproval: true`) until an admin approves. Does **not** start a session — user logs in after. |
| POST | `/auth/login` | public | Returns `accessToken` + user; sets `refresh_token` httpOnly cookie (path `/v1/auth`) |
| POST | `/auth/refresh` | public (valid refresh token) | Rotates the refresh token (new cookie each call); reuse of an old token revokes **all** the user's sessions (`AUTH_TOKEN_REUSED`). Token accepted from cookie, body `refreshToken`, or `Authorization: Bearer` |
| POST | `/auth/logout` | authenticated | Revokes refresh token + clears cookie |
| GET | `/auth/me` | authenticated | Current user profile (`{ id, email, fullName, role, avatarUrl, departmentName }`) |
| POST | `/auth/forgot-password` | public | Creates a 1-hour reset token + sends reset link (`FRONTEND_URL`). Responds 200 for unknown emails (no enumeration). Dev/test mode echoes `resetToken`/`resetLink` in the response |
| POST | `/auth/reset-password` | public | Body `{ token, newPassword }`. Single-use; revokes all refresh tokens for the user |

## Users & Departments (Admin)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/admin/users` | admin | List/filter/search users |
| POST | `/admin/users` | admin | Create lecturer/admin account |
| PATCH | `/admin/users/:id` | admin | Update role, deactivate, etc. |
| DELETE | `/admin/users/:id` | admin | Deactivate (soft delete) |
| GET | `/admin/departments` | admin | List departments |
| POST | `/admin/departments` | admin | Create department |

## Courses

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/courses` | student/lecturer | List courses (student: enrolled only; lecturer: owned) |
| GET | `/courses/:id` | enrolled student/owning lecturer | Course detail + outline |
| POST | `/courses` | lecturer/admin | Create course |
| PATCH | `/courses/:id` | owning lecturer/admin | Update course/outline |
| POST | `/courses/:id/enroll` | student | Self-enroll (if open enrollment) |
| GET | `/admin/courses` | admin | All courses, any department |

## Materials

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/courses/:id/materials` | enrolled student/owning lecturer | List current materials |
| POST | `/materials/upload-url` | lecturer | Request signed Supabase upload URL |
| POST | `/materials` | lecturer | Finalize material record after upload |
| POST | `/materials/:id/versions` | owning lecturer | Upload new version (creates new row, marks old `is_current=false`) |
| GET | `/materials/:id/download-url` | enrolled student/owning lecturer/admin | Signed short-lived download URL |

## Assignments & Submissions

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/courses/:id/assignments` | student/lecturer | List assignments (student rows include own `mySubmission`) |
| POST | `/assignments` | owning lecturer | Create assignment (deadline must be in the future) |
| PATCH | `/assignments/:id` | owning lecturer | Update deadline/instructions/maxScore/late policy |
| POST | `/submissions/upload-url` | student | Signed upload URL (enforces deadline + enrollment) |
| POST | `/submissions` | student | Finalize submission (requires uploaded object; re-submitting bumps `attempts` and writes history) |
| GET | `/assignments/:id/submissions` | owning lecturer | List all submissions for grading |
| PATCH | `/submissions/:id/grade` | owning lecturer | Set score + feedback (sends `feedback` notification; rejects score > maxScore) |
| GET | `/submissions/:id/download-url` | owner/owning lecturer/admin | Signed short-lived download URL |

## Exams

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/courses/:id/exams` | student/lecturer | List exams |
| POST | `/exams` | owning lecturer | Create exam |
| PATCH | `/exams/:id` | owning lecturer | Update schedule/venue/instructions/duration |

## Quizzes

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/courses/:id/quizzes` | student/lecturer | List quizzes (student rows include own best score) |
| POST | `/quizzes` | lecturer | Create quiz with questions (MCQ + true/false); `aiGenerated` flag optional (default false) |
| POST | `/quizzes/generate` | lecturer | AI question generation. Body `{ courseId, materialId?, numQuestions? (1–20, default 5) }`. Extracts text from a course material, calls Groq, returns **validated draft questions for review — nothing is saved**. Rate-limited (6/min by default). Errors: `MATERIAL_NOT_FOUND`, `MATERIAL_TEXT_EMPTY`, `MATERIAL_TYPE_UNSUPPORTED`, `PDF_PARSE_FAILED`, `GROQ_UNAVAILABLE` (503 no key / 502 Groq failure), `AI_OUTPUT_INVALID` (502 output failed schema validation after retries), `TOO_MANY_REQUESTS` (429) |
| PATCH | `/quizzes/:id` | owning lecturer | Update quiz + replace questions; set `aiGenerated` for transparency |
| POST | `/quizzes/:id/start` | student | Start attempt (returns question IDs **without** correct answers; one attempt per student) |
| POST | `/quizzes/:id/submit` | student | Submit answers → server auto-grades; returns score + per-question results (correct answers revealed) |
| GET | `/quizzes/:id/results` | student | View own graded result (full per-question breakdown) |

## Performance

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/performance/me` | student | Own overall snapshot + metrics: `{ overall: { snapshot, metrics } }` — GPA, per-course averages, missed-submission rate |
| GET | `/performance/me/risk` | student | Own risk breakdown: `{ gpaDecline, missedSubmissionRate, quizDecline, lowEngagement, score, level, lastSnapshotDate }` (deterministic, `workflows.md` formula) |
| GET | `/performance/courses/:id` | owning lecturer | Course aggregates + per-student rows (gpa, assignment/quiz %, risk score/level) |
| GET | `/admin/performance/at-risk` | admin | Latest overall snapshot per student; default `minScore` = 0.33 (medium+) so only actionable students show. Overrides: `?minScore=0` (everyone with a snapshot), `?level=medium\|high` |
| POST | `/admin/performance/recompute-snapshots` | admin | One-off recompute (all students, or `?courseId=` for one course). Same code path as the weekly cron |

## Notifications

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/notifications` | authenticated | List own notifications (paginated) |
| PATCH | `/notifications/:id/read` | authenticated | Mark as read |
| POST | `/announcements` | lecturer/admin | Post announcement (course-scoped or system-wide) |

## Admin — System

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/admin/activity-logs` | admin | Filterable audit log |
| GET | `/admin/reports/overview` | admin | System-wide usage/report summary |
| GET | `/admin/reports/export` | admin | CSV/PDF export of a given report |

---

## Error Codes (partial reference)

| Code | Meaning |
|---|---|
| `AUTH_INVALID_CREDENTIALS` | Login failed |
| `AUTH_TOKEN_EXPIRED` | Access token expired, use refresh |
| `FORBIDDEN_ROLE` | Authenticated but role not permitted |
| `NOT_ENROLLED` | Student not enrolled in target course |
| `NOT_COURSE_OWNER` | Lecturer/admin acting on a course they do not own |
| `DEADLINE_PAST` | Assignment created/updated with a past deadline |
| `DEADLINE_PASSED` | Submission attempted after deadline (and late not allowed) |
| `SCORE_EXCEEDS_MAX` | Grade score above the assignment maxScore |
| `SUBMISSION_FILE_MISSING` | Finalize referenced a storage object that does not exist |
| `QUIZ_NOT_AVAILABLE` | Quiz window has not opened yet |
| `QUIZ_CLOSED` | Quiz window has already closed |
| `QUIZ_ALREADY_ATTEMPTED` | Student already submitted this quiz (one attempt) |
| `QUIZ_TIME_EXPIRED` | Time limit exceeded — attempt auto-submitted |
| `INVALID_QUESTION` | Submitted answer references a question not in the quiz |
| `QUIZ_NOT_TAKEN` | No graded attempt to view results for |
| `GROQ_UNAVAILABLE` | AI generation not configured (503, no key) or Groq call failed (502) |
| `AI_OUTPUT_INVALID` | Groq output failed schema validation after retries (502) |
| `MATERIAL_NOT_FOUND` | No current material in the course to generate from, or selected material missing |
| `MATERIAL_TEXT_EMPTY` | Material has no extractable text (422) |
| `MATERIAL_TYPE_UNSUPPORTED` | PPTX materials can't be text-extracted in v1 (422) |
| `PDF_PARSE_FAILED` | pdf-parse failed on the material (422) |
| `TOO_MANY_REQUESTS` | Rate limit exceeded (429; quiz generation defaults to 6/min) |
| `VALIDATION_ERROR` | Request body failed schema validation |
| `NOT_FOUND` | Resource does not exist or not visible to requester |

## Conventions

- All list endpoints support `?page=&limit=` pagination, default `limit=20`.
- All mutating endpoints validate request bodies with a schema library (e.g. Zod) before touching the DB.
- File-related endpoints never accept raw file bytes through the API — always the signed-URL pattern described in `architecture.md`.
