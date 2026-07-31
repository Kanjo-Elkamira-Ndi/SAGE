# SAGE — Mobile (Flutter) Roadmap

> **Role scope:** The Flutter app covers **student + lecturer**. The **admin console is a web app** (React + Vite in `web/`, Tailwind + shadcn/ui + TanStack Query) wired to the **same Express API**. All clients (web app, web admin, Flutter mobile) are thin clients over the single backend; Postgres is never touched directly by any client.

## 1. Current State
- `mobile/` is a fresh `flutter create` scaffold (Flutter 3.44.2, Dart SDK ^3.12.2). Nothing built yet.
- `web/` has marketing site + 7 auth screens + 12 student screens (React, mock data) — the design reference for the student module.
- `api/src/**` is **0 bytes** — Express API is contract-documented only (`api-reference.md`, `database-schema.md`). All clients target this contract.
- Design system fully specified in `docs/ui-context.md` (Royal Blue `#1E3A8A`, White, Gold `#D4A017`, Dark Grey `#2D2E33`).

## 2. Architecture Core: "Mock First, Wire Later"
Every feature talks to a typed **repository interface**, never to HTTP directly:

```
UI (Widgets)
  ├── Application (Riverpod providers/controllers)
  ├── Domain (models — Course, Assignment, Quiz, ...)
  └── Data (repositories)
        ├── MockRepository (now — in-memory, seeded from web screen data)
        └── ApiRepository (later — dio + JWT refresh)
```

Providers bind to `MockRepository` from Phase 0–6, then rebind to `ApiRepository` with a one-line override when the API lands. **No UI rewrites.** Models mirror `api-reference.md` exactly (camelCase JSON, `{success, data|error}` envelope, `page/limit` pagination).

## 3. Stack & Packages
| Concern | Choice |
|---|---|
| State management | `flutter_riverpod` |
| Routing | `go_router` — role-aware redirect (`/student/*`, `/lecturer/*`) |
| HTTP (Phase 6) | `dio` + interceptor (401 → refresh → retry) |
| Storage | `flutter_secure_storage` (tokens), `shared_preferences` (session flags) |
| Charts | `fl_chart` (matches web Recharts) |
| PDF | `pdfx` / platform view (Phase 6) |

## 4. Project Structure
```
mobile/lib/
├── main.dart
├── app/                  # MaterialApp + theme + router
│   ├── app.dart
│   ├── router.dart       # go_router, role redirects
│   └── theme/
│       ├── sage_colors.dart
│       └── sage_theme.dart
├── core/                 # ApiClient (dio), secure storage, env, exceptions
├── features/
│   ├── auth/             # login, register, forgot/reset
│   ├── student/          # 12 screens
│   └── lecturer/         # course mgmt, grading, quiz builder
├── shared/widgets/       # SAGEButton, SageCard, SageBadge, ProgressBar, EmptyState, AppShell
└── data/
    ├── models/
    └── repositories/     # interfaces + mock/ implementations
```

Design system maps `ui-context.md` → Material. Gold = fill/indicator only, never small text (AA constraint).

## 5. Execution Phases

### Phase 0 — Scaffold & Design System
Replace counter demo; wire `SageTheme`, `AppColors`, typography. `go_router` skeleton with student/lecturer role redirects; Riverpod bootstrap. Auth gate: `/` → auth or role home.

### Phase 1 — Shared Widget Library
Primitives: buttons (primary/outline/destructive), cards, status/risk badges, progress bar + circular ring, empty states, skeletons, `AppShell` (bottom nav + drawer combo), `TopBar`. Reused across both roles.

### Phase 2 — Auth (mirrors web auth screens)
Login, Register, Forgot Password, Check Email, Reset Password, Reset Success, Reset Expired. `AuthRepository` + `AuthController`; mock login accepts demo student/lecturer creds; token storage API stubbed now.

### Phase 3 — Student Module (mirrors the 12 web screens)
Dashboard · My Courses · Course Detail · Course Materials · Material Viewer · Assignments List · Assignment Detail · Quizzes List · Quiz In Progress · Quiz Results · Performance Dashboard · Notifications Center.
- Bottom nav: **Home, Courses, Quizzes, Performance, Notifications**; drawer: **Profile, Settings, Help**.
- Mock data seeded to match web screen content; quiz timer/flagging; risk badges (green/amber/red semantics).

### Phase 4 — Lecturer Module (net-new design; no web counterpart yet — authored from API contract + frontend-roadmap §3–5)
Dashboard · My Courses · Course Create/Edit · Outline editor · Materials Upload (signed-URL flow UI) · Assignments Create · Submissions list + Grading · Quiz Builder (manual) + AI-Assist panel (draft → review → publish) · Course Performance.
- Mock-first, same repository pattern.

### Phase 5 — Admin Console: Web App (separate track, same API)
Not in Flutter. Built in `web/` (React + Vite, Tailwind + shadcn/ui, TanStack Query — per `code-standards.md` and `frontend-roadmap.md` Phase 8).
Screens: Dashboard/overview · User Management (search/filter/create/deactivate) · Departments · Courses oversight · Activity Log viewer · Reports (stats + export).
- Admin is mock-first too (MSW per frontend-roadmap), wired when the API lands.

### Phase 6 — API Wiring (Flutter)
`ApiClient` (dio): base URL via `--dart-define`/env, Bearer injection, 401→refresh→retry, error mapping to typed `SageException` (maps error codes from `api-reference.md`). Implement `ApiAuthRepository`, `ApiCourseRepository`, ... per endpoint contract; swap Riverpod bindings; delete mock files as endpoints land.

### Phase 7 — Polish (Flutter)
Skeletons, error/retry/empty states, pull-to-refresh, notification badge polling, PDF viewing, platform builds (Android APK / iOS).

## 6. Cross-Cutting (all tracks)
- API contract is the single source of truth for permissions; UI hiding is UX, not security (API enforces).
- Conventional commits; PRs against `develop`; no direct `main` pushes (`code-standards.md`).

## 7. Verification
- `flutter analyze` clean after every phase; `flutter test` for repositories, models, auth controller (not UI).
- `npm run build` + `npx tsc --noEmit` clean in `web/` after admin phases.
- Manual run on Android emulator after each milestone; compare student screens visually against web.

## 8. Tradeoffs / Notes
- Lecturer screens are net-new design work (web has no lecturer UI yet); mock data authored from the API contract.
- Student module (Phase 3) is the demoable milestone; Phases 4–5 can be scheduled after it lands.
- Mock-first means the app demos on emulator with no backend running.
