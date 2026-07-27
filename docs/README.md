# SAGE — Smart Academy Guidance Engine

**SAGE** is an AI-augmented academic management platform built for university students, lecturers, and administrators. It centralizes course delivery, assessment, performance tracking, and academic notifications into a single system — with AI woven in where it genuinely adds value: quiz generation, personalized study nudges, and plain-language performance narration.

SAGE is not "add a chatbot to an LMS." The design principle throughout is: **statistics compute, AI narrates.** Academic risk scoring, GPA trends, and grade calculations are deterministic and explainable. Groq-powered AI is used to turn that data into study plans, summaries, and reminders a student will actually read.

---

## ✨ Core Modules

| Module | Description |
|---|---|
| **Course & Materials** | Lecturers create courses, upload notes/PDFs/slides; students browse, view outlines, and download materials anytime. |
| **Assignments & Quizzes** | Lecturers set assignments/quizzes with deadlines; students submit and get instant quiz grading + lecturer feedback. |
| **Performance Tracking** | GPA, quiz/assignment performance, progress charts, current-vs-previous comparison, and at-risk prediction. |
| **Notifications** | Deadline reminders, new material alerts, lecturer announcements, and AI-generated personalized study reminders. |
| **Administration** | Account, course, and department management; system monitoring; reporting; permissions. |
| **Public Marketing Site** | A public-facing site to explore SAGE before signing up (no login required). |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend (app + marketing site) | React (Vite) + TypeScript, hosted on **Vercel** |
| Backend API | Node.js + Express + TypeScript (raw SQL via `pg`, no ORM), hosted on **Render/Railway** |
| Database | **Supabase Postgres** |
| File Storage | **Supabase Storage** (PDFs, slides, notes — video is out of scope for v1) |
| AI Provider | **Groq** (Llama-family models via OpenAI-compatible API) |
| Auth | JWT (access + refresh token pattern) |
| Scheduled Jobs | `node-cron`, running inside the Express service |
| Charts | Recharts |
| Styling | Tailwind CSS + shadcn/ui |

> **Why this split?** Vercel is excellent for the React frontend and static marketing pages, but Vercel serverless functions are a poor fit for long-running jobs, cron-driven notifications, and unbounded AI/file-processing work. Running Express on a persistent host (Render/Railway) removes all of that friction — see `architecture.md` for the full reasoning.

---

## 📁 Repository Structure

This is a **monorepo** with two deployable applications:

```
sage/
├── apps/
│   ├── web/              # React (Vite) frontend — app + marketing site
│   └── api/               # Express backend API
├── docs/                  # All project context/documentation (this folder)
└── README.md
```

See `file-structure.md` for the full breakdown of each app.

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- A Supabase project (Postgres + Storage)
- A Groq API key
- npm or pnpm

### 1. Clone & install
```bash
git clone <repo-url> sage
cd sage
npm install --prefix apps/web
npm install --prefix apps/api
```

### 2. Environment variables
Copy `.env.example` in each app to `.env` and fill in values. See `security.md` for what each variable is and how it should be handled.

### 3. Database setup
Run the migrations described in `database-schema.md` against your Supabase Postgres instance.

### 4. Run locally
```bash
# Terminal 1 — API
cd apps/api && npm run dev

# Terminal 2 — Web
cd apps/web && npm run dev
```

---

## 📚 Documentation Index

All architecture and planning docs live in `/docs`:

- `project-overview.md` — goals, scope, users, success criteria
- `architecture.md` — system architecture and infrastructure decisions
- `database-schema.md` — full schema, relationships, and rationale
- `api-reference.md` — REST API contract
- `backend-roadmap.md` — phased backend build plan
- `frontend-roadmap.md` — phased frontend build plan
- `file-structure.md` — directory layout for both apps
- `code-standards.md` — conventions, naming, patterns
- `security.md` — auth, RBAC, secrets, data protection
- `ui-context.md` — design system, color palette, components
- `workflows.md` — end-to-end user flows per role

---

## 👤 Author

Built by **Kanjo Elkamira Ndi ("Alchemy")** — DigiMark Consulting.

## 📄 License

Proprietary — built under client engagement. Not for redistribution without permission.
