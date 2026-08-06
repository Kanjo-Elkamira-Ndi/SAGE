# SAGE — Database Schema

Postgres (Supabase). Raw SQL, no ORM. All tables use `uuid` primary keys (`gen_random_uuid()`) unless noted. All tables carry `created_at`/`updated_at` timestamps (`timestamptz`, default `now()`).

> Convention: FK columns are named `<referenced_table_singular>_id`. Enum-like fields use Postgres `CHECK` constraints or native `ENUM` types where the value set is stable.

---

## 1. Identity & Access

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | text UNIQUE NOT NULL | |
| password_hash | text NOT NULL | bcrypt/argon2 |
| full_name | text NOT NULL | |
| role | enum('student','lecturer','admin') NOT NULL | |
| department_id | uuid FK → departments.id | nullable for admin |
| avatar_url | text | nullable |
| is_active | boolean DEFAULT true | admin can deactivate |
| activated_at | timestamptz | null = account awaiting admin approval (students self-activate at registration; lecturer/admin signups stay null until an admin activates them) |
| last_login_at | timestamptz | nullable |

### `departments`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| code | text UNIQUE NOT NULL | e.g. "CS", "EEE" |

### `refresh_tokens`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| token_hash | text NOT NULL | never store raw token |
| expires_at | timestamptz NOT NULL | |
| revoked_at | timestamptz | nullable |

### `permissions` (headroom for fine-grained admin control beyond role)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| permission_key | text NOT NULL | e.g. `courses.manage_all` |

---

## 2. Courses & Materials

### `courses`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text NOT NULL | |
| code | text UNIQUE NOT NULL | e.g. "CSC301" |
| description | text | |
| department_id | uuid FK → departments.id | |
| lecturer_id | uuid FK → users.id | primary instructor |
| credit_units | int | |
| semester | text | e.g. "2026/1" |
| outline | text | course outline content (markdown) |
| is_active | boolean DEFAULT true | |

### `enrollments`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| student_id | uuid FK → users.id | |
| course_id | uuid FK → courses.id | |
| enrolled_at | timestamptz | |
| status | enum('active','dropped','completed') DEFAULT 'active' | |
| UNIQUE(student_id, course_id) | | prevent duplicate enrollment |

### `materials`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| course_id | uuid FK → courses.id | |
| uploaded_by | uuid FK → users.id | |
| title | text NOT NULL | |
| type | enum('pdf','pptx','notes') NOT NULL | video intentionally excluded v1 |
| storage_key | text NOT NULL | Supabase Storage object path |
| file_size_bytes | bigint | |
| version | int DEFAULT 1 | |
| is_current | boolean DEFAULT true | only one current version per (course_id, title) |
| replaces_material_id | uuid FK → materials.id | nullable, self-referential version chain |

> Versioning: on "update," insert a new row with `version + 1`, set old row `is_current = false`. Never overwrite/delete — preserves history for students who need the prior version and for audit purposes.

---

## 3. Assignments & Quizzes

### `assignments`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| course_id | uuid FK → courses.id | |
| created_by | uuid FK → users.id | |
| title | text NOT NULL | |
| instructions | text | |
| max_score | numeric DEFAULT 100 | |
| deadline_at | timestamptz NOT NULL | |
| allow_late_submission | boolean DEFAULT false | |

### `submissions`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| assignment_id | uuid FK → assignments.id | |
| student_id | uuid FK → users.id | |
| storage_key | text NOT NULL | |
| submitted_at | timestamptz | |
| is_late | boolean DEFAULT false | |
| score | numeric | nullable until graded |
| feedback | text | nullable |
| graded_by | uuid FK → users.id | nullable |
| graded_at | timestamptz | nullable |
| UNIQUE(assignment_id, student_id) | | one active submission per student; resubmission overwrites with history table below |

### `submission_history` (append-only, for resubmissions/audit)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| submission_id | uuid FK → submissions.id | |
| storage_key | text | |
| submitted_at | timestamptz | |

### `quizzes`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| course_id | uuid FK → courses.id | |
| created_by | uuid FK → users.id | |
| title | text NOT NULL | |
| time_limit_minutes | int | nullable |
| available_from | timestamptz | |
| available_until | timestamptz | |
| ai_generated | boolean DEFAULT false | flags AI-assisted quizzes for transparency |

### `quiz_questions`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| quiz_id | uuid FK → quizzes.id | |
| question_text | text NOT NULL | |
| question_type | enum('mcq','true_false') NOT NULL | v1 supports auto-gradable types only |
| options | jsonb | array of option strings for MCQ |
| correct_answer | text NOT NULL | |
| points | numeric DEFAULT 1 | |

### `quiz_attempts`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| quiz_id | uuid FK → quizzes.id | |
| student_id | uuid FK → users.id | |
| started_at | timestamptz | |
| submitted_at | timestamptz | nullable |
| score | numeric | nullable until submitted |
| answers | jsonb | `{question_id: answer}` |

---

## 4. Performance Tracking

### `performance_snapshots` (computed periodically, not on every request)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| student_id | uuid FK → users.id | |
| course_id | uuid FK → courses.id | nullable — null = overall GPA snapshot |
| snapshot_date | date | |
| gpa | numeric | nullable if course-level |
| avg_assignment_score | numeric | |
| avg_quiz_score | numeric | |
| risk_score | numeric | 0–1, rule-based computation, see `workflows.md` |
| risk_level | enum('low','medium','high') | derived from risk_score thresholds |

> Rationale: precomputing snapshots (e.g. weekly, or on relevant grade events) avoids recalculating GPA/trend/risk on every dashboard load, and gives a clean "current vs previous" comparison for free — just diff two snapshot rows.

---

## 5. Notifications

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| type | enum('deadline_reminder','new_material','announcement','feedback','ai_study_plan','system') | |
| title | text NOT NULL | |
| body | text | |
| related_entity_type | text | nullable, e.g. "assignment" |
| related_entity_id | uuid | nullable |
| is_read | boolean DEFAULT false | |

### `notifications_sent` (idempotency guard for cron jobs)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | |
| event_type | text NOT NULL | |
| event_ref_id | uuid NOT NULL | e.g. assignment_id |
| sent_at | timestamptz | |
| UNIQUE(user_id, event_type, event_ref_id) | | prevents duplicate sends |

### `announcements`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| course_id | uuid FK → courses.id | nullable — null = system-wide (admin) |
| posted_by | uuid FK → users.id | |
| title | text | |
| body | text | |

---

## 6. Administration & Audit

### `activity_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users.id | nullable (system events) |
| action | text NOT NULL | e.g. "material.upload", "user.deactivate" |
| entity_type | text | |
| entity_id | uuid | |
| metadata | jsonb | free-form context |
| ip_address | text | nullable |

---

## 7. Indexing Notes

- `enrollments(student_id)`, `enrollments(course_id)` — frequent joins for "my courses"
- `materials(course_id, is_current)` — students loading current materials
- `submissions(student_id)`, `quiz_attempts(student_id)` — performance queries
- `notifications(user_id, is_read)` — unread count/badge queries
- `performance_snapshots(student_id, snapshot_date DESC)` — latest-snapshot lookups

## 8. Migration Strategy

Use plain numbered SQL migration files (`001_init.sql`, `002_add_notifications.sql`, ...) run via a small migration runner script (`node-pg-migrate` is acceptable since it doesn't impose an ORM — it just runs SQL). Never hand-edit the Supabase schema through the dashboard for anything that needs to be reproducible.
