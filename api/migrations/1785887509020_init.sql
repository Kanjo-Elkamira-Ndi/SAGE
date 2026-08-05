-- SAGE database — initial schema
-- Matches docs/database-schema.md. New `exams` table added per implementation decision.

CREATE TABLE departments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  code       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name     text NOT NULL,
  role          text NOT NULL CHECK (role IN ('student','lecturer','admin')),
  department_id uuid REFERENCES departments(id),
  avatar_url    text,
  is_active     boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id),
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id),
  permission_key text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission_key)
);

CREATE TABLE courses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  code          text NOT NULL UNIQUE,
  description   text,
  department_id uuid REFERENCES departments(id),
  lecturer_id   uuid REFERENCES users(id),
  credit_units  int,
  semester      text,
  outline       text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES users(id),
  course_id   uuid NOT NULL REFERENCES courses(id),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','dropped','completed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE TABLE materials (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id            uuid NOT NULL REFERENCES courses(id),
  uploaded_by          uuid NOT NULL REFERENCES users(id),
  title                text NOT NULL,
  type                 text NOT NULL CHECK (type IN ('pdf','pptx','notes')),
  storage_key          text NOT NULL,
  file_size_bytes      bigint,
  version              int NOT NULL DEFAULT 1,
  is_current           boolean NOT NULL DEFAULT true,
  replaces_material_id uuid REFERENCES materials(id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE assignments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id             uuid NOT NULL REFERENCES courses(id),
  created_by            uuid NOT NULL REFERENCES users(id),
  title                 text NOT NULL,
  instructions          text,
  max_score             numeric NOT NULL DEFAULT 100,
  deadline_at           timestamptz NOT NULL,
  allow_late_submission boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id),
  student_id    uuid NOT NULL REFERENCES users(id),
  storage_key   text NOT NULL,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  is_late       boolean NOT NULL DEFAULT false,
  score         numeric,
  feedback      text,
  graded_by     uuid REFERENCES users(id),
  graded_at     timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE submission_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id),
  storage_key   text NOT NULL,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quizzes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id         uuid NOT NULL REFERENCES courses(id),
  created_by        uuid NOT NULL REFERENCES users(id),
  title             text NOT NULL,
  time_limit_minutes int,
  available_from    timestamptz,
  available_until   timestamptz,
  ai_generated      boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quiz_questions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        uuid NOT NULL REFERENCES quizzes(id),
  question_text  text NOT NULL,
  question_type  text NOT NULL CHECK (question_type IN ('mcq','true_false')),
  options        jsonb,
  correct_answer text NOT NULL,
  points         numeric NOT NULL DEFAULT 1,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quiz_attempts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      uuid NOT NULL REFERENCES quizzes(id),
  student_id   uuid NOT NULL REFERENCES users(id),
  started_at   timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score        numeric,
  answers      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE exams (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        uuid NOT NULL REFERENCES courses(id),
  created_by       uuid NOT NULL REFERENCES users(id),
  title            text NOT NULL,
  scheduled_at     timestamptz NOT NULL,
  duration_minutes int,
  venue            text,
  instructions     text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE performance_snapshots (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid NOT NULL REFERENCES users(id),
  course_id           uuid REFERENCES courses(id),
  snapshot_date       date NOT NULL DEFAULT current_date,
  gpa                 numeric,
  avg_assignment_score numeric,
  avg_quiz_score      numeric,
  risk_score          numeric,
  risk_level          text CHECK (risk_level IN ('low','medium','high')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id),
  type                text NOT NULL CHECK (type IN ('deadline_reminder','new_material','announcement','feedback','ai_study_plan','system')),
  title               text NOT NULL,
  body                text,
  related_entity_type text,
  related_entity_id   uuid,
  is_read             boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications_sent (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id),
  event_type    text NOT NULL,
  event_ref_id  uuid NOT NULL,
  sent_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_type, event_ref_id)
);

CREATE TABLE announcements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid REFERENCES courses(id),
  posted_by  uuid NOT NULL REFERENCES users(id),
  title      text,
  body       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id),
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb,
  ip_address  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes (docs/database-schema.md §7)
CREATE INDEX enrollments_student_id_idx ON enrollments (student_id);
CREATE INDEX enrollments_course_id_idx ON enrollments (course_id);
CREATE INDEX materials_course_current_idx ON materials (course_id, is_current);
CREATE INDEX submissions_student_id_idx ON submissions (student_id);
CREATE INDEX quiz_attempts_student_id_idx ON quiz_attempts (student_id);
CREATE INDEX notifications_user_read_idx ON notifications (user_id, is_read);
CREATE INDEX performance_snapshots_student_date_idx ON performance_snapshots (student_id, snapshot_date DESC);
CREATE INDEX exams_course_id_idx ON exams (course_id);
CREATE INDEX exams_scheduled_at_idx ON exams (scheduled_at);
CREATE INDEX activity_logs_user_id_idx ON activity_logs (user_id);
CREATE INDEX activity_logs_created_at_idx ON activity_logs (created_at);
CREATE INDEX courses_department_id_idx ON courses (department_id);
CREATE INDEX courses_lecturer_id_idx ON courses (lecturer_id);
