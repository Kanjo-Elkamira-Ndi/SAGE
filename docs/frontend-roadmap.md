# SAGE — Frontend Roadmap (React + Vite)

Build order tracks the backend roadmap so each frontend phase has real endpoints to hit, not mocks lingering too long. Use MSW (Mock Service Worker) only where the backend phase is genuinely ahead of frontend, and remove mocks as soon as the real endpoint lands.

## Phase 0 — Project Setup & Design System
- Vite + React + TypeScript scaffold.
- Tailwind CSS + shadcn/ui installed, design tokens wired per `ui-context.md` (Royal Blue / White / Gold / Dark Grey palette).
- Routing: React Router, with route groups mirroring `(marketing)`, `(auth)`, `(student)`, `(lecturer)`, `(admin)`.
- Global layout shells: marketing layout (public nav/footer), app shell (authenticated sidebar/topbar, role-aware).
- API client wrapper (fetch/axios instance with base URL, auth header injection, refresh-on-401 handling).

## Phase 1 — Public Marketing Site
- Landing page: hero, module overview (map to the 5 core modules), how-it-works, CTA to register/login.
- About/contact pages as needed.
- Fully static-friendly, no auth required — this is the "browse before signing up" experience the client asked for.

## Phase 2 — Auth Flows
- Register (student self-service), login, logout.
- Token storage strategy per `security.md` (access token in memory, refresh handled via silent refresh call).
- Protected route wrapper + role-based redirect (student/lecturer/admin land on different dashboards post-login).

## Phase 3 — Course & Materials (Student + Lecturer)
- Lecturer: create course form, course list, material upload (direct-to-Supabase via signed URL from API), material version history view.
- Student: enrolled course list, course detail (outline + materials list), download material (signed URL fetch + open/download).
- Empty states designed deliberately (no courses yet, no materials yet) — don't leave these as afterthoughts.

## Phase 4 — Assignments & Submissions
- Lecturer: create assignment form (deadline picker, instructions), submissions list + grading UI (score input + feedback textarea).
- Student: assignment list (with deadline countdown/urgency indicator), submission upload flow, view own grade/feedback once graded.

## Phase 5 — Quizzes
- Lecturer: manual quiz builder (question + options + correct answer), and an **AI-assist panel** that calls `/quizzes/generate`, shows draft questions with an explicit "review before publishing" step — never auto-publish silently.
- Student: quiz-taking UI (timer if applicable, one question at a time or single page depending on quiz length), instant result screen post-submit.

## Phase 6 — Performance Dashboards
- Student: GPA display, per-course performance cards, progress charts (Recharts — line chart for trend, bar for per-course comparison), current-vs-previous comparison view, at-risk explanation card (plain-language, generated from the risk score — clearly framed as "based on your recent performance," not a diagnosis).
- Lecturer: course-level aggregate performance view (class average, distribution).
- Admin: system-wide at-risk student list.

## Phase 7 — Notifications
- Notification bell/badge in app shell (unread count).
- Notification list page/dropdown, mark-as-read interaction.
- Announcement composer for lecturers/admins.

## Phase 8 — Admin Console
- User management table (search/filter, create lecturer/admin, deactivate).
- Department/course oversight views.
- Activity log viewer (filterable).
- Reports page (overview stats, export buttons).

## Phase 9 — Polish
- Loading/skeleton states across all data-fetching views.
- Error boundaries + friendly error states (never a raw stack trace to the user).
- Responsive pass — this is a student-facing product, mobile browser usage will be high.
- Accessibility pass (color contrast against the palette — see `ui-context.md` for pre-checked combinations, keyboard navigation, focus states).

## Cross-Cutting
- Component library grows bottom-up: build primitives (Button, Card, Badge, Table, Modal) once in Phase 0–1 per `ui-context.md`, reuse everywhere — don't let each phase invent new one-off components.
- Every authenticated page assumes the API is the source of truth for permissions — UI hiding a button is a UX nicety, not a security boundary (the API enforces it regardless).
