# SAGE — File Structure

Monorepo, two apps, shared docs.

```
sage/
├── docs/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-reference.md
│   ├── backend-roadmap.md
│   ├── frontend-roadmap.md
│   ├── file-structure.md
│   ├── code-standards.md
│   ├── security.md
│   ├── ui-context.md
│   └── workflows.md
│
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── env.ts               # env loading + validation
│   │   │   │   └── db.ts                # pg Pool setup
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts              # JWT verify
│   │   │   │   ├── requireRole.ts
│   │   │   │   ├── errorHandler.ts
│   │   │   │   └── validate.ts          # Zod schema wrapper
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── auth.schema.ts   # Zod validation schemas
│   │   │   │   ├── users/
│   │   │   │   ├── courses/
│   │   │   │   ├── materials/
│   │   │   │   ├── assignments/
│   │   │   │   ├── quizzes/
│   │   │   │   ├── performance/
│   │   │   │   ├── notifications/
│   │   │   │   └── admin/
│   │   │   │       (each module follows the same routes/controller/service/schema pattern)
│   │   │   ├── lib/
│   │   │   │   ├── groq.ts              # Groq client wrapper
│   │   │   │   ├── storage.ts           # Supabase Storage signed URL helpers
│   │   │   │   ├── mailer.ts            # email sending (if used)
│   │   │   │   └── logger.ts
│   │   │   ├── jobs/
│   │   │   │   ├── scheduler.ts         # node-cron registration
│   │   │   │   ├── deadlineReminders.job.ts
│   │   │   │   ├── studyPlan.job.ts
│   │   │   │   └── performanceSnapshot.job.ts
│   │   │   ├── db/
│   │   │   │   ├── migrations/          # 001_init.sql, 002_..., etc.
│   │   │   │   └── queries/              # raw SQL query modules per entity
│   │   │   ├── types/
│   │   │   ├── app.ts                    # Express app assembly
│   │   │   └── server.ts                 # entrypoint
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/
│       ├── src/
│       │   ├── app/                      # route-level pages (mirrors React Router structure)
│       │   │   ├── marketing/
│       │   │   ├── auth/
│       │   │   ├── student/
│       │   │   ├── lecturer/
│       │   │   └── admin/
│       │   ├── components/
│       │   │   ├── ui/                   # shadcn primitives (Button, Card, Badge, etc.)
│       │   │   ├── layout/               # AppShell, MarketingLayout, Sidebar, Topbar
│       │   │   └── shared/               # cross-role composed components
│       │   ├── features/
│       │   │   ├── courses/
│       │   │   ├── materials/
│       │   │   ├── assignments/
│       │   │   ├── quizzes/
│       │   │   ├── performance/
│       │   │   └── notifications/
│       │   │       (each has: components/, hooks/, api.ts, types.ts)
│       │   ├── lib/
│       │   │   ├── apiClient.ts          # fetch wrapper, auth header, refresh logic
│       │   │   ├── supabaseStorage.ts    # direct upload helper
│       │   │   └── queryClient.ts        # TanStack Query setup
│       │   ├── hooks/
│       │   ├── context/
│       │   │   └── AuthContext.tsx
│       │   ├── styles/
│       │   │   └── tokens.css            # CSS variables — see ui-context.md
│       │   ├── routes.tsx
│       │   └── main.tsx
│       ├── .env.example
│       ├── package.json
│       └── vite.config.ts
│
└── README.md
```

## Notes
- Backend `modules/` follow **routes → controller → service → schema** consistently; controllers stay thin (parse request, call service, shape response), services hold business logic and raw SQL calls.
- Frontend `features/` are self-contained: a feature folder owns its own API calls, hooks, and components — avoid a giant shared `api/` file that every feature dumps into.
- Any AI agent (opencode, Lovable, etc.) generating code for this project should place new backend logic inside the matching `modules/<name>/` folder and new frontend logic inside the matching `features/<name>/` folder — never create a new top-level pattern without checking this file first.
