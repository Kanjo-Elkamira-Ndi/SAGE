# SAGE — System Architecture

## 1. High-Level Diagram (described)

```
┌─────────────────────────┐        ┌──────────────────────────┐
│   React (Vite) Frontend  │ HTTPS  │     Express API           │
│   Vercel                 │◄──────►│     Render / Railway      │
│   - Marketing site        │  JWT   │     - REST endpoints      │
│   - Student app           │        │     - Auth (JWT issue)    │
│   - Lecturer app          │        │     - node-cron jobs      │
│   - Admin app              │        │     - Groq AI calls       │
└─────────────────────────┘        └────────────┬─────────────┘
                                                   │
                                     raw SQL (pg)  │
                                                   ▼
                                    ┌──────────────────────────┐
                                    │   Supabase Postgres        │
                                    └──────────────────────────┘
                                                   │
                                    ┌──────────────────────────┐
                                    │   Supabase Storage          │
                                    │   (PDFs, PPTX, notes)       │
                                    └──────────────────────────┘
                                                   │
                                    ┌──────────────────────────┐
                                    │   Groq API (LLM)            │
                                    └──────────────────────────┘
```

## 2. Why This Split (Vercel + Render/Railway, not full-stack-on-Vercel)

SAGE deliberately does **not** run its backend as Vercel serverless functions. Reasons:

1. **No persistent process on Vercel.** Notifications, deadline reminders, and AI-generated study plans need scheduled background execution. Vercel functions are invoked per-request and cannot run a standing `node-cron` loop. Achieving this on Vercel would require an external job orchestration service (Inngest/QStash) — extra infrastructure and a new mental model, for no functional benefit over just running Express somewhere with a persistent process.
2. **Function duration ceilings.** PDF text extraction → Groq quiz generation, or large report generation, can take longer than is comfortable inside a serverless function budget. Express on Render/Railway has no such ceiling.
3. **Connection pooling simplicity.** A long-lived Express process holds a normal `pg.Pool`. Serverless functions spin up many concurrent invocations, each wanting a DB connection, which requires specialized poolers to avoid exhausting Postgres. Avoiding that complexity is a real win for a solo-built system.
4. **Team familiarity = velocity.** The team has shipped multiple PERN (raw pg, no ORM) projects. Sticking to it is a deliberate, informed choice, not a shortcut.

**Tradeoff accepted:** two deployments instead of one, CORS configuration, and JWT-over-header auth instead of same-origin cookies. This is a small, well-understood cost against the benefits above.

## 3. Component Responsibilities

### Frontend (`apps/web`)
- Renders all UI for marketing site, student app, lecturer app, admin app.
- Never talks to Postgres or Supabase directly for app data — always through the Express API.
- Talks to **Supabase Storage directly** only for the upload/download step itself, using short-lived signed URLs issued by the API (the API decides *whether* a user is allowed to upload/download; Supabase just serves bytes).
- Holds JWT access token in memory (or short-lived storage) and refresh token appropriately (see `security.md`).

### Backend (`apps/api`)
- All business logic: auth, RBAC, course/material/assignment/quiz CRUD, grading, performance calculations, notification dispatch, Groq integration.
- Issues signed upload/download URLs for Supabase Storage rather than proxying file bytes.
- Runs `node-cron` schedules in-process for deadline reminders and daily digest jobs.
- Owns all Groq API calls (frontend never calls Groq directly — protects the API key and lets the backend enforce data boundaries on what context is sent to the model).

### Database (Supabase Postgres)
- Single source of truth for all structured data.
- Accessed only from the Express API via raw parameterized SQL (`pg`).

### Storage (Supabase Storage)
- Buckets for lecture notes, PDFs, PPTX files, and submission uploads.
- Access controlled by signed URLs generated server-side; buckets are private, not public.

### AI (Groq)
- Used for: (a) generating draft quiz questions from lecture note text, (b) narrating performance/risk data into a personalized study plan, (c) summarizing lecturer feedback trends.
- Never used to compute GPA, grades, or risk scores — those are deterministic SQL/application logic. See `workflows.md` for the exact division of labor per AI-touching feature.

## 4. Request Flow Example — Assignment Submission

1. Student selects a file in the React app.
2. Frontend calls `POST /api/submissions/upload-url` with assignment ID and file metadata.
3. API checks enrollment + deadline, then returns a signed Supabase Storage upload URL.
4. Frontend uploads the file directly to Supabase Storage using that URL.
5. Frontend calls `POST /api/submissions` with the storage object key to finalize the submission record.
6. API writes the `submissions` row, triggers a "submission received" notification, and (if past deadline) flags it as late per course policy.

## 5. Background Job Flow — Deadline Reminders

1. `node-cron` fires hourly inside the Express process.
2. Job queries assignments/quizzes/exams with deadlines in the next N hours.
3. For each affected enrollment, checks `notifications_sent` (unique on `user_id, event_type, event_ref_id`) to avoid duplicate sends.
4. Writes a `notifications` row (in-app) and optionally sends email.
5. A separate daily job computes personalized study plans: pulls each student's recent performance snapshot, calls Groq to phrase a short study recommendation, stores it as a notification.

## 6. Environments

| Environment | Frontend | API | Database |
|---|---|---|---|
| Local dev | Vite dev server | `nodemon` / `ts-node-dev` | Supabase project (dev) or local Postgres |
| Staging | Vercel preview | Render/Railway staging service | Supabase (staging schema or project) |
| Production | Vercel production | Render/Railway production service | Supabase (production project) |

## 7. Scaling Notes (for later, not v1-blocking)

- If AI workloads grow heavy (bulk quiz generation across many courses), introduce a lightweight queue (BullMQ + Redis) inside the Express service rather than migrating to a new platform.
- If file volume grows significantly, revisit Supabase Storage limits and consider Cloudflare R2 as a drop-in replacement (same signed-URL pattern).
