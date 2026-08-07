# SAGE — API Wiring Plan

How each client talks to the Express API (`api/`). Two audiences:

1. **Mobile app** (`mobile/`, Flutter) — **student + lecturer** roles.
2. **Admin console** (`web/`, React + Vite) — **admin** role only.

Both are thin clients. The API is the source of truth for permissions; hiding a button in the UI is UX, never a security boundary. This plan is the concrete bridge between the mock-first screens (`mobile-roadmap.md` Phase 6, `frontend-roadmap.md` Phase 8) and the real endpoints in `api-reference.md`.

Base URL placeholder: `https://api.sage.app/v1` (dev: `http://localhost:4000/v1`).

**Status (Part A — mobile):** Section 0 (shared contract) is implemented in `mobile/lib/core/*` (dio client, Bearer + 401→refresh→retry, cookie jar, error-code copy map, secure storage, pagination). Auth screens are wired via `ApiAuthRepository`, and **every student and lecturer screen is live against the API** (`mobile/lib/features/{student,lecturer}/*`, `data/repositories/api/*`): Dashboard, Courses, Course detail (materials/assignments/quizzes/exams/feed), Tasks, Submit assignment (signed upload), Quiz attempt + results, Performance analytics, Notifications, and the lecturer Dashboard/Courses/Tasks/Course management (materials + announcements CRUD)/Create assignment/Grading. Repository bindings live in `data/repositories/api_repository_providers.dart`; the mock repositories and display models (`mock_student_repository`, `mock_lecturer_repository`, `models/lecturer.dart`, legacy `StudentController`) were deleted. `flutter analyze` clean, 9 widget tests green. Verified end-to-end against `localhost:4000` (register → login → me → courses → notifications → performance → read-all → forgot-password → 429).

**Status (Part B — admin console):** `web/src/lib/apiClient.ts` implements the shared contract (Bearer + 401→refresh→retry, in-memory token, `AUTH_TOKEN_REUSED` → force logout, blob/CSV download). `context/AuthContext.tsx` (validate-on-mount, session-expired handler) + `RequireAdmin` gate `/admin`. Every admin screen (`web/src/app/admin/*`) is wired to TanStack Query hooks over `features/admin/{api,queries}.ts`; `features/admin/data.ts` deleted. The auth flow is complete: Login, Register (`EMAIL_TAKEN` → field error, `pendingApproval` state), Forgot Password → Check Email (resend), Reset Password (token query param, `RESET_TOKEN_INVALID/USED/EXPIRED` → `/reset-expired`). `AdminLayout` header shows the real signed-in admin. `npx tsc --noEmit` clean, `npm run build` green, auth flow smoke-tested against `localhost:4000`. The student web app remains mock-only (out of scope).

---

## 0. Shared Client Contract (both apps)

Every client must implement this once, in the API layer, before any screen is wired.

### 0.1 Response envelope

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "code": "STRING_CODE", "message": "Human readable" } }
```

- List endpoints return `{ items, total, ... }` (notifications additionally `unread`; admin users additionally `pending`).
- Errors carry a machine-readable `code`. Map codes to user-facing copy once in a shared place — never render `message` verbatim for non-validation errors.

### 0.2 Authentication & session

| Endpoint | When | Notes |
|---|---|---|
| `POST /auth/login` | App start (no cached session) / explicit logout-then-login | Body `{ email, password }`. Returns `data.accessToken` + `data.user`; sets `refresh_token` **httpOnly cookie** scoped to `/v1/auth`. |
| `POST /auth/refresh` | 401 during any request | Cookie-authenticated. **Rotates** the refresh token on every call. If the presented token was already rotated → `AUTH_TOKEN_REUSED`, and **all the user's sessions are revoked** → force full logout. |
| `POST /auth/logout` | User signs out | Revokes refresh token + clears cookie. |
| `GET /auth/me` | App start (validate cached session), profile refresh | Returns `{ id, email, fullName, role, avatarUrl, departmentName }`. |
| `POST /auth/register` | Onboarding | Student self-activates. Lecturer/admin signups return `pendingApproval: true` — no session started, show "awaiting approval" state. |

**Refresh strategy (identical shape in dio and fetch):**

1. All requests send `Authorization: Bearer <accessToken>`.
2. On `401 AUTH_TOKEN_EXPIRED` → call `POST /auth/refresh` once (with the cookie) → get new access token → retry the original request.
3. `401 AUTH_TOKEN_REUSED` → tokens were stolen/rotated → wipe local state, redirect to login, show "Signed out everywhere".
4. On refresh failure → wipe local state, redirect to login.
5. **Never** expose the refresh token to app code. The cookie is httpOnly; mobile apps must enable cookie persistence in the HTTP client (dio: `CookieJar`). The mobile app only ever stores the **access token** (secure storage). 

> **Mobile caveat:** the refresh token is an httpOnly cookie in the current API design. For Flutter, a `dio_cookie_manager` + persistent `CookieJar` must be configured so the cookie survives app restarts. If cookie support is rejected during mobile testing, the API accepts the refresh token in the body `{ refreshToken }` or `Authorization: Bearer <refreshToken>` instead (see `api-reference.md` `/auth/refresh`) — decide during mobile wiring and keep the choice consistent.

### 0.3 Error handling contract

- `VALIDATION_ERROR` (400): response includes `details.fieldErrors` — render field-level messages on the form.
- `AUTH_TOKEN_EXPIRED` (401): trigger refresh flow (0.2).
- `FORBIDDEN_ROLE` (403): role-gated screen should never be reachable — treat as a routing bug, log it, redirect to role home.
- `USER_PENDING_APPROVAL` (403 on login): show "Account awaiting admin approval".
- `USER_DEACTIVATED` (403 on login/refresh): show "Account deactivated — contact administration".
- `TOO_MANY_REQUESTS` (429): disable the submit button and show "Too many attempts — try again shortly". Never auto-retry.
- Everything else (5xx, network): generic error state + retry affordance.

### 0.4 Pagination

All lists: `?page=` (1-based, default 1) & `?limit=` (default 20). UI patterns: infinite scroll (mobile), page buttons or "Load more" (web admin tables).

### 0.5 File transfer — signed-URL flow

**Files never cross the API as bytes.** The pattern (upload):

1. `POST /materials/upload-url` (or `/submissions/upload-url`) → `{ uploadUrl, objectKey, ... }`.
2. `PUT` / `POST` the raw bytes **directly to Supabase Storage** using `uploadUrl` (client-side).
3. `POST /materials` (or `/submissions`) to finalize — server verifies the object exists, then it's live.

Download:

1. `GET /materials/:id/download-url` (or `/submissions/:id/download-url`) → short-lived signed URL.
2. Fetch the URL and stream to a file / open in a viewer.

Signed URLs expire quickly (downloads default 5 min) — always fetch a fresh one at download time, never cache it.

### 0.6 Rate-limit awareness (UX)

- Auth endpoints: 10 attempts / 15 min / IP (`AUTH_RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_WINDOW_MS`).
- `POST /quizzes/generate`: 6 / min (`QUIZ_GENERATE_MAX_PER_MINUTE`).
- Client should disable buttons during in-flight auth/quiz-generation calls and surface the 429 message; there is no client-side counter that can beat the server, so never attempt "sneaky" retries.

---

## Part A — Mobile App (Flutter: student + lecturer)

### A.0 Infrastructure (do first — one slice) — ✅ implemented (`mobile/lib/core/*`)

- [x] **`core/api_client.dart`**: dio instance, base URL from `--dart-define=SAGE_API_URL`, `CookieJar` for refresh cookie, `InterceptorsWrapper` implementing 0.2 (401 → refresh → retry; `AUTH_TOKEN_REUSED` → logout).
- [x] **`core/auth_storage.dart`**: `flutter_secure_storage` for the access token; session flags in `shared_preferences`.
- [x] **`core/sage_exception.dart`**: `SageException(code, message, fieldErrors)`; error-code → copy map (0.3).
- [~] **`data/repositories/`**: `ApiAuthRepository`, `ApiCourseRepository`, `ApiNotificationRepository`, `ApiPerformanceRepository` implemented; `ApiMaterial/Assignment/Submission/Quiz/Exam/Announcement` still pending.
- [~] Models: API models added for course/notification/performance; remaining screens still use the mock `StudentCourse`/`AppNotification` models.

### A.1 Auth screens (Phase 2 screens, first real wiring) — ✅ implemented

| Screen | Endpoint(s) | Notes |
|---|---|---|
| Login | `POST /auth/login`, then `GET /auth/me` | On success store access token, route by `user.role`. Handle `USER_PENDING_APPROVAL` / `USER_DEACTIVATED`. |
| Register | `POST /auth/register` | Student → straight to login. Lecturer/admin → "awaiting approval" screen. |
| Forgot Password | `POST /auth/forgot-password` | Always show "if an account exists, a reset link was sent" (no enumeration). |
| Reset Password | `POST /auth/reset-password` `{ token, newPassword }` | On success → login. |
| (App start) | `GET /auth/me` | Validate cached access token; if 401, silent refresh; if still 401, login screen. |
| (Anywhere) | `POST /auth/logout` | Then clear local storage + redirect. |

### A.2 Student screens → endpoints

✅ = wired to the API (providers in `features/student/student_controller.dart`).

| Screen | Endpoints |
|---|---|
| Dashboard ✅ | `GET /courses` (enrolled), `GET /notifications` (unread badge), `GET /performance/me` (overview card) |
| My Courses / Course list ✅ | `GET /courses` |
| Course Detail ✅ | `GET /courses/:id` (via enrolled list), `GET /courses/:id/materials`, `GET /courses/:id/assignments`, `GET /courses/:id/quizzes`, `GET /courses/:id/exams`, `GET /announcements` (feed filter) |
| Course Materials ✅ | `GET /courses/:id/materials` (tiles with type/size/version); `GET /materials/:id/download-url` → signed URL copied for the viewer |
| Material Viewer | `GET /materials/:id/download-url` → stream to viewer (`pdfx`). Download URL is surfaced today; native viewer deferred |
| Assignments List ✅ | `GET /courses/:id/assignments` (student rows include `mySubmission`) |
| Assignment Detail ✅ | detail from the row (`GET /courses/:id/assignments`) |
| Submit assignment ✅ | `POST /submissions/upload-url` → PUT to Supabase → `POST /submissions` (finalize). Re-submit bumps `attempts`; handles `DEADLINE_PASSED` |
| Quizzes List ✅ | `GET /courses/:id/quizzes` (student rows include own best score) |
| Quiz In Progress ✅ | `POST /quizzes/:id/start` (question IDs, no answers) → `POST /quizzes/:id/submit` (auto-graded). Handles `QUIZ_NOT_AVAILABLE`, `QUIZ_CLOSED`, `QUIZ_ALREADY_ATTEMPTED`; client countdown matches server time limit and auto-submits on expiry |
| Quiz Results ✅ | `GET /quizzes/:id/results` (reopen) |
| Performance Dashboard ✅ | `GET /performance/me` (overall + metrics), `GET /performance/me/risk` (risk breakdown card) |
| Notifications Center ✅ | `GET /notifications` (`?isRead=&type=`), `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`. Unread badge = `data.unread` |
| Enroll | `POST /courses/:id/enroll` (no open-enrollment UI entry point) |

### A.3 Lecturer screens → endpoints

✅ = wired to the API (providers in `features/lecturer/lecturer_controller.dart`).

| Screen | Endpoints |
|---|---|
| Dashboard ✅ | `GET /courses` (owned), `GET /assignments/:id/submissions` (pending-count fan-out) |
| My Courses ✅ | `GET /courses` |
| Course Create/Edit | `POST /courses`, `PATCH /courses/:id` (outline editor) |
| Course Detail / Management ✅ | `GET /courses/:id`, `GET /courses/:id/materials` (upload via signed URL), `GET /courses/:id/assignments`, `GET /courses/:id/exams`, `GET /courses/:id/quizzes`; Materials + Announcements tabs CRUD |
| Materials Upload ✅ | `POST /materials/upload-url` → PUT to Supabase → `POST /materials` finalize. `POST /materials/:id/versions` for new versions deferred |
| Assignments Create ✅ | `POST /assignments` (client validates deadline is future) |
| Submissions list + Grading ✅ | `GET /assignments/:id/submissions`, `PATCH /submissions/:id/grade` (`{ score, feedback }`) |
| Exam management | `POST /exams`, `PATCH /exams/:id` |
| Quiz Builder (manual) | `POST /quizzes`, `PATCH /quizzes/:id` |
| AI-Assist panel | `POST /quizzes/generate` `{ courseId, materialId?, numQuestions? }` → returns **draft questions only** — review in UI, then publish via `POST /quizzes`. Handle `MATERIAL_*`, `PDF_PARSE_FAILED`, `GROQ_UNAVAILABLE`, `AI_OUTPUT_INVALID`, `TOO_MANY_REQUESTS` (429, 6/min) |
| Course Performance | `GET /performance/courses/:id` (provider exists; per-student risk table not yet on a screen) |
| Announcements (create) ✅ | `POST /announcements` `{ title, body, courseId? }`, `DELETE /announcements/:id` — no courseId = school-wide |

### A.4 Wiring order (mobile)

1. ✅ `ApiAuthRepository` + Auth screens → session gate works end-to-end.
2. ✅ `ApiCourseRepository` + `ApiNotificationRepository` (+ `ApiPerformanceRepository`) → student Dashboard + Course list + Notifications live.
3. ✅ `ApiMaterialRepository` (signed upload/download) → Materials (student tiles + lecturer upload).
4. ✅ `ApiAssignmentRepository` → Assignments, Submit (signed upload/finalize), Tasks, Grading.
5. ✅ `ApiQuizRepository` → Quiz attempt + results.
6. ✅ `ApiExamRepository`, `ApiAnnouncementRepository` → course detail exams, lecturer announcement CRUD.
7. ✅ Deleted the mock repositories and display models (`mock_student_repository`, `mock_lecturer_repository`, `models/lecturer.dart`, legacy `StudentController`); `flutter analyze` clean + 9 widget tests pass.

---

## Part B — Admin Console (web app)

The admin pages already exist as screens with mock data (`web/src/app/admin/*`, data in `web/src/features/admin/data.ts`, feature API stubs in `web/src/features/*/api.ts` are empty). Wiring replaces mock data with TanStack Query hooks over the real endpoints. All admin endpoints are behind `requireRole('admin')` — a non-admin hitting any of them gets `403 FORBIDDEN_ROLE`.

### B.0 Infrastructure

- **`web/src/lib/apiClient.ts`** (currently empty): typed `fetch` wrapper — base URL, Bearer injection, 401 → `POST /auth/refresh` → retry, `AUTH_TOKEN_REUSED` → force logout (0.2). Access token kept in memory per `security.md`.
- **`web/src/lib/queryClient.ts`** already exists — add global handlers: `onError` maps `SageApiError`, 401 triggers the refresh flow, 429 disables submit buttons.
- Per feature: implement the empty `api.ts` as typed functions returning `data` (envelope unwrapped) + add a `queries.ts` (or inline hooks) with `useQuery`/`useMutation` per endpoint, `queryKey` per resource.

### B.1 Screens → endpoints

| Screen | Endpoints | Notes |
|---|---|---|
| Dashboard | `GET /admin/dashboard/stats` | Returns `{ totalStudents, totalLecturers, activeCourses, pendingLecturers, totalEnrollments, announcements, atRisk: { count, byLevel }, retention: { labels, values }, recentActivity }`. Replaces the hard-coded `dashboardStats`/`retentionData`/`recentActivity` in `features/admin/data.ts`. Retention chart is daily enrollments (last 14 days) — adapt the mock chart (monthly) to the real `labels/values` |
| Users | `GET /admin/users` (`?role=&status=active\|pending\|deactivated&q=&page=&limit=` → `{ items, total, pending }`) | Search (debounced), filter chips, pagination. "Pending" tab uses `status=pending`; pending badge from `data.pending` |
| User actions | `PATCH /admin/users/:userId/status` `{ isActive }`, `PATCH /admin/users/:userId/role` `{ role }` | Invalidate users query + dashboard after mutation. Server blocks self-deactivation / self-role-change → surface `VALIDATION_ERROR` |
| Permissions | `GET /admin/users/:userId/permissions` → `{ userId, permissions }`; `POST` / `DELETE /admin/users/:userId/permissions` `{ permission }` | Grant is idempotent; refresh after each |
| Departments | `GET /admin/departments` (`?page=&limit=` → `{ items, total }`, each with `lecturerCount`); `POST /admin/departments` `{ name, code }`; `PATCH /admin/departments/:id` | Handle `DEPARTMENT_CODE_TAKEN` (409) inline on the code field |
| Activity Logs | `GET /admin/activity-logs` (`?user=&action=&limit=`) | `action` is ILIKE substring. Rows: `{ id, userId, userName, action, entityType, entityId, metadata, ipAddress, createdAt }` |
| Reports / At-Risk | `GET /admin/reports/at-risk` (`?minScore=&level=low\|medium\|high`) | Default `minScore=0.33` — only medium+ show. Filters map to the query; invalid `minScore` → `VALIDATION_ERROR` (400) |
| At-Risk export | `GET /admin/reports/at-risk/export` | CSV download with auth header; stream/save with `filename="at-risk-students.csv"` |
| Snapshots | `POST /admin/performance/recompute-snapshots` `{ courseId? }` | One-off recompute; shows `{ processed }`; confirm dialog before hitting it |
| Announcements | `GET /announcements` (paginated, newest first), `POST /announcements`, `PATCH /announcements/:id`, `DELETE /announcements/:id` | `POST` returns `{ announcement, notified }` — toast "Notified N users" |
| Courses oversight | `GET /admin/courses` (`adminCourseRoutes`, paginated) | Dedicated admin list (all courses, regardless of owner) |

### B.2 CSV export details

`/admin/reports/at-risk/export` is not JSON — it returns `text/csv` with a `Content-Disposition: attachment`. The wrapper must:

1. Send `Authorization: Bearer` (default fetch with `credentials` also carries the refresh cookie).
2. Read the response as a `Blob`.
3. Create an object URL + anchor click to download as `at-risk-students.csv`.
4. Run the same refresh-on-401 logic as JSON calls.

### B.3 Wiring order (admin)

1. `lib/apiClient.ts` + refresh flow + error mapping.
2. `features/admin` queries for **Dashboard** + **Users** (+ actions) — the two most visible screens.
3. **Departments**, **Permissions**.
4. **Activity Logs** (filterable).
5. **Reports/At-Risk** + CSV export + recompute.
6. **Announcements**, **Courses oversight**.
7. Delete `features/admin/data.ts` mock exports once nothing references them; `npm run build` + `npx tsc --noEmit` after each slice.

---

## Appendix A — Endpoint inventory (authoritative, from `api/src/routes.ts`)

### Public
| Method | Endpoint | Role |
|---|---|---|
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | valid refresh token |
| POST | `/auth/forgot-password` | public |
| POST | `/auth/reset-password` | public |

### Authenticated (any role)
| Method | Endpoint | Role |
|---|---|---|
| POST | `/auth/logout` | auth |
| GET | `/auth/me` | auth |
| GET | `/courses/:id/materials` | student/lecturer/admin |
| GET | `/courses/:id/assignments` | student/lecturer/admin |
| GET | `/courses/:id/exams` | student/lecturer/admin |
| GET | `/courses/:id/quizzes` | student/lecturer/admin |
| GET | `/courses/:id` | student/lecturer/admin |
| GET | `/notifications` | auth |
| PATCH | `/notifications/read-all` | auth |
| PATCH | `/notifications/:id/read` | auth |
| GET | `/announcements` | auth |

### Student
| Method | Endpoint |
|---|---|
| GET | `/courses` (enrolled) |
| POST | `/courses/:id/enroll` |
| POST | `/submissions/upload-url` |
| POST | `/submissions` |
| GET | `/submissions/:id/download-url` (owner) |
| POST | `/quizzes/:id/start` |
| POST | `/quizzes/:id/submit` |
| GET | `/quizzes/:id/results` |
| GET | `/performance/me` |
| GET | `/performance/me/risk` |

### Lecturer
| Method | Endpoint |
|---|---|
| POST | `/courses` (or admin) |
| PATCH | `/courses/:id` (or admin) |
| GET | `/courses` (owned) |
| POST | `/materials/upload-url` |
| POST | `/materials` |
| POST | `/materials/:id/versions` |
| GET | `/materials/:id/download-url` (own) |
| POST | `/assignments` |
| PATCH | `/assignments/:id` |
| GET | `/assignments/:id/submissions` |
| PATCH | `/submissions/:id/grade` |
| GET | `/submissions/:id/download-url` (owning lecturer) |
| POST | `/exams` |
| PATCH | `/exams/:id` |
| POST | `/quizzes` |
| POST | `/quizzes/generate` (rate-limited 6/min) |
| PATCH | `/quizzes/:id` |
| GET | `/performance/courses/:id` |
| POST | `/announcements` (or admin) |
| PATCH | `/announcements/:id` (or admin) |

### Admin
| Method | Endpoint |
|---|---|
| GET | `/admin/courses` |
| GET | `/admin/dashboard/stats` |
| GET | `/admin/users` |
| PATCH | `/admin/users/:userId/status` |
| PATCH | `/admin/users/:userId/role` |
| GET | `/admin/users/:userId/permissions` |
| POST | `/admin/users/:userId/permissions` |
| DELETE | `/admin/users/:userId/permissions` |
| GET | `/admin/departments` |
| POST | `/admin/departments` |
| PATCH | `/admin/departments/:departmentId` |
| GET | `/admin/activity-logs` |
| GET | `/admin/reports/at-risk` |
| GET | `/admin/reports/at-risk/export` (CSV) |
| POST | `/admin/performance/recompute-snapshots` |
| DELETE | `/announcements/:id` |

## Appendix B — Key response shapes (from `api/src/modules/**`)

```jsonc
// POST /auth/login → data
{ "accessToken": "...", "user": { "id": "...", "email": "...", "fullName": "...", "role": "student", "avatarUrl": null, "departmentName": null } }

// GET /notifications → data
{ "items": [{ "id": "...", "userId": "...", "type": "deadline_reminder", "title": "...", "body": "...", "relatedEntityType": null, "relatedEntityId": null, "isRead": false, "createdAt": "ISO" }], "total": 12, "unread": 3 }

// GET /admin/users → data
{ "items": [{ "id": "...", "email": "...", "fullName": "...", "role": "lecturer", "departmentId": null, "departmentName": null, "isActive": true, "activatedAt": null, "lastLoginAt": null, "createdAt": "ISO" }], "total": 0, "pending": 0 }

// GET /admin/reports/at-risk → data
{ "items": [{ "studentId": "...", "name": "...", "email": "...", "riskScore": 0.42, "riskLevel": "medium", "gpa": 3.1, "avgAssignmentPct": 68, "avgQuizPct": 71, "lastSnapshotDate": "ISO", "reasons": ["..."] }], "csv": "..." }

// GET /admin/dashboard/stats → data
{ "totalStudents": 0, "totalLecturers": 0, "activeCourses": 0, "pendingLecturers": 0, "totalEnrollments": 0, "announcements": 0,
  "atRisk": { "count": 0, "byLevel": { "low": 0, "medium": 0, "high": 0 } },
  "retention": { "labels": ["YYYY-MM-DD", "..."], "values": [0, ...] },
  "recentActivity": [{ "id": "...", "action": "auth.login", "entityType": null, "entityId": null, "createdAt": "ISO", "userName": "..." }] }

// GET /admin/activity-logs → data
{ "items": [{ "id": "...", "userId": "...", "userName": "...", "action": "user_activated", "entityType": "user", "entityId": "...", "metadata": null, "ipAddress": "127.0.0.1", "createdAt": "ISO" }], "total": 0 }
```

## Appendix C — Verification per client

**Mobile** (`mobile/`):
- `flutter analyze` clean, `flutter test` for repositories/models/auth controller after every wiring slice.
- Contract smoke-tested against `localhost:4000` with the exact shapes the client parses: register (student auto-activates) → login (`accessToken`+`user`) → `/auth/me` → `/courses` (`items`/`total`) → `/notifications` (`items`/`total`/`unread`) → `/performance/me` (`overall.metrics`) → `/notifications/read-all` (`updated`) → `/auth/forgot-password` (dev-mode reset token) → 11th failed login returns `429 TOO_MANY_REQUESTS`. Course-row fields verified from `api/src/modules/courses/courses.service.ts` (Appendix B).
- Manual on Android emulator: login → role home → navigate each screen with **real** seeded data; confirm refresh survives app restart; kill network mid-session → error states, no crash.

**Admin web** (`web/`):
- `npm run build` + `npx tsc --noEmit` clean after each slice.
- Manual: login as seed admin → dashboard numbers match DB → filter/search users → grant/revoke permission → view logs → at-risk report + CSV download → recompute snapshots.
