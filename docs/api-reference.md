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
| GET | `/courses/:id/materials` | enrolled student/lecturer | List current materials |
| POST | `/materials/upload-url` | lecturer | Request signed Supabase upload URL |
| POST | `/materials` | lecturer | Finalize material record after upload |
| PATCH | `/materials/:id` | owning lecturer | Upload new version (creates new row, marks old `is_current=false`) |
| GET | `/materials/:id/download-url` | enrolled student | Signed short-lived download URL |

## Assignments & Submissions

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/courses/:id/assignments` | student/lecturer | List assignments |
| POST | `/assignments` | lecturer | Create assignment |
| PATCH | `/assignments/:id` | owning lecturer | Update deadline/instructions |
| POST | `/submissions/upload-url` | student | Signed upload URL (checks deadline/enrollment) |
| POST | `/submissions` | student | Finalize submission |
| GET | `/assignments/:id/submissions` | lecturer | List all submissions for grading |
| PATCH | `/submissions/:id/grade` | lecturer | Set score + feedback |

## Quizzes

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/courses/:id/quizzes` | student/lecturer | List quizzes |
| POST | `/quizzes` | lecturer | Create quiz manually |
| POST | `/quizzes/generate` | lecturer | AI-assisted question generation from a material's text (Groq) — returns draft questions for lecturer review, does not auto-publish |
| PATCH | `/quizzes/:id` | owning lecturer | Update quiz/questions |
| POST | `/quizzes/:id/start` | student | Start attempt (creates `quiz_attempts` row) |
| POST | `/quizzes/:id/submit` | student | Submit answers → instant auto-grade |
| GET | `/quizzes/:id/results` | student | View own result |

## Performance

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/performance/me` | student | Own GPA, trends, charts data |
| GET | `/performance/me/risk` | student | Own risk level + plain-language explanation |
| GET | `/performance/course/:id` | lecturer | Aggregate course performance stats |
| GET | `/admin/performance/at-risk` | admin/lecturer | List of currently at-risk students |

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
| `DEADLINE_PASSED` | Submission attempted after deadline (and late not allowed) |
| `VALIDATION_ERROR` | Request body failed schema validation |
| `NOT_FOUND` | Resource does not exist or not visible to requester |

## Conventions

- All list endpoints support `?page=&limit=` pagination, default `limit=20`.
- All mutating endpoints validate request bodies with a schema library (e.g. Zod) before touching the DB.
- File-related endpoints never accept raw file bytes through the API — always the signed-URL pattern described in `architecture.md`.
