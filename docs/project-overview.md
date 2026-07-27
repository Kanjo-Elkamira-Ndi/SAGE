# SAGE — Project Overview

## 1. What SAGE Is

SAGE (Smart Academy Guidance Engine) is a web-based academic management platform for universities. It gives **students** a single place to access course materials, submit work, take quizzes, and track their academic performance; gives **lecturers** tools to deliver content and assess students; and gives **administrators** oversight of the whole system.

The "smart" in SAGE comes from two AI-assisted capabilities layered on top of a conventional, deterministic academic records system:
1. AI-assisted **quiz question generation** from uploaded lecture notes.
2. AI-generated **personalized study reminders and performance narration**, built on top of statistically-computed risk scores and progress data (the AI never invents the numbers — it explains them).

## 2. Primary Users

| Role | Who they are | Core need |
|---|---|---|
| **Student** | University students enrolled in one or more courses | Access materials, submit assessments, understand their own performance, never miss a deadline |
| **Lecturer** | Course instructors | Publish materials, set and grade assessments, give feedback |
| **Administrator** | University/system admins | Manage accounts, courses, departments, permissions, and monitor system health |
| **Prospective visitor** | Anyone not yet registered | Learn what SAGE is via the public marketing site before signing up |

## 3. Scope for v1

**In scope:**
- Course creation and enrollment
- Material upload: PDF, PowerPoint, and text-based lecture notes (with versioning)
- Assignments: creation, submission, deadlines, grading, feedback
- Quizzes: creation, auto-grading (objective question types), instant results
- Performance tracking: GPA, per-course performance, progress charts, current-vs-previous comparison
- At-risk prediction (rule-based, statistically computed)
- Notifications: deadline reminders, new material alerts, announcements, AI-generated study reminders
- Admin: user/course/department management, activity monitoring, reporting, permissions
- Public marketing site (unauthenticated)

**Explicitly out of scope for v1:**
- Video lecture upload/hosting (deferred — cost/complexity tradeoff not favorable yet; architecture should not block adding it later)
- Live/synchronous features (video calls, live chat)
- Payment processing
- Mobile native apps (responsive web only)

## 4. Success Criteria

- A student can register for a course, access all materials, submit an assignment, take a quiz, and see their grade/feedback without friction.
- A lecturer can go from "create course" to "grade submissions" without leaving the platform.
- Performance dashboards give a student an honest, explainable answer to "how am I doing, and where am I weak?"
- At-risk flags are defensible — a supervisor or lecturer could ask "why was this student flagged?" and get a clear, data-backed answer, never "the AI said so."
- The system runs reliably on a modest hosting budget (Render/Railway free-to-low-tier + Supabase free/pro tier + Vercel).

## 5. Design Philosophy

- **Statistics compute, AI narrates.** Anything that determines a grade, GPA, or risk status is deterministic and auditable. AI is only used for generation (quiz drafts) and natural-language explanation (reminders, summaries) — never as the source of truth for a number.
- **Progressive build, demoable at every phase.** Each roadmap phase should produce something a client/supervisor can actually see and use, not just backend plumbing.
- **No ORM, raw SQL.** Full control over queries, easier to reason about performance, consistent with prior project stack.
- **Two deployables, clear boundary.** Frontend (Vercel) never talks to the database directly. All data access goes through the Express API.
