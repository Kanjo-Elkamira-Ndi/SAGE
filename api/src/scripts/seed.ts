import argon2 from 'argon2';
import { pool } from '../config/db';

const DEPARTMENTS = [
  { name: 'Department of Arts', code: 'ARTS' },
  { name: 'Engineering', code: 'ENG' },
  { name: 'Digital Humanities', code: 'DH' },
  { name: 'Institution Maintenance', code: 'MNT' },
];

const ADMIN_EMAIL = 'admin@sage.app';
const ADMIN_PASSWORD = 'Admin@123';

// Demo credentials printed at the end so you can log into the app right away.
const STUDENT_EMAIL = 'kanjo@gmail.com';
const LECTURER_EMAIL = 'kanjo1@gmail.com';
const DEMO_PASSWORD = 'Kanjo@123';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number): Date => new Date(Date.now() + days * DAY_MS);

async function first<T>(client: { query: (text: string, params?: unknown[]) => Promise<{ rows: T[] }> }, text: string, params: unknown[] = []): Promise<T> {
  const result = await client.query(text, params);
  if (!result.rows.length) throw new Error(`Seed lookup returned no row: ${text}`);
  return result.rows[0];
}

async function seed(): Promise<void> {
  await pool.query('BEGIN');
  try {
    for (const d of DEPARTMENTS) {
      await pool.query(
        'INSERT INTO departments (name, code) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
        [d.name, d.code],
      );
    }

    const departmentIds: Record<string, string> = {};
    for (const d of DEPARTMENTS) {
      departmentIds[d.code] = (
        await first<{ id: string }>(pool, 'SELECT id FROM departments WHERE code = $1', [d.code])
      ).id;
    }

    const adminHash = await argon2.hash(ADMIN_PASSWORD);
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [ADMIN_EMAIL, adminHash, 'System Administrator', 'admin', departmentIds['MNT']],
    );

    // ---- Demo users -----------------------------------------------------------
    const [studentHash, lecturerHash] = await Promise.all([
      argon2.hash(DEMO_PASSWORD),
      argon2.hash(DEMO_PASSWORD),
    ]);
    const student = await first<{ id: string }>(
      pool,
      `INSERT INTO users (email, password_hash, full_name, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         department_id = EXCLUDED.department_id,
         is_active = true
       RETURNING id`,
      [STUDENT_EMAIL, studentHash, 'Kanjo Demo', 'student', departmentIds['ENG']],
    );
    const lecturer = await first<{ id: string }>(
      pool,
      `INSERT INTO users (email, password_hash, full_name, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         department_id = EXCLUDED.department_id,
         is_active = true
       RETURNING id`,
      [LECTURER_EMAIL, lecturerHash, 'Dr. Kanjo Demo', 'lecturer', departmentIds['ENG']],
    );

    // ---- Courses --------------------------------------------------------------
    type CourseDef = {
      code: string;
      title: string;
      description: string;
      dept: string;
      units: number;
      semester: string;
      outline: string;
    };
    const courseDefs: CourseDef[] = [
      {
        code: 'CS402',
        title: 'Advanced Algorithms',
        description:
          'Design and analysis of advanced algorithms: divide and conquer, dynamic programming, and graph algorithms with formal complexity arguments.',
        dept: 'ENG',
        units: 3,
        semester: '2025/2026 · Second Semester',
        outline:
          '1. Asymptotic analysis\n2. Divide and conquer\n3. Dynamic programming\n4. Greedy algorithms\n5. Graph traversal and shortest paths\n6. NP-completeness',
      },
      {
        code: 'CS301',
        title: 'Database Systems',
        description:
          'Relational model, SQL, schema design and normalization, transactions, and indexing for building robust data-backed applications.',
        dept: 'ENG',
        units: 3,
        semester: '2025/2026 · Second Semester',
        outline:
          '1. Relational model\n2. SQL fundamentals\n3. ER design\n4. Normalization\n5. Transactions and concurrency\n6. Query optimization',
      },
      {
        code: 'DH210',
        title: 'Digital Humanities Lab',
        description:
          'Hands-on lab applying computational methods to humanities research: text analysis, corpus linguistics, and data visualisation.',
        dept: 'DH',
        units: 2,
        semester: '2025/2026 · Second Semester',
        outline:
          '1. Corpus linguistics\n2. Text mining\n3. Network analysis\n4. Data visualisation\n5. Project design',
      },
      {
        code: 'ARTS120',
        title: 'Introduction to Art History',
        description:
          'Survey of Western art from the Renaissance to the modern era: movements, iconography, and techniques of critical analysis.',
        dept: 'ARTS',
        units: 2,
        semester: '2025/2026 · Second Semester',
        outline:
          '1. Renaissance\n2. Baroque and Rococo\n3. Romanticism\n4. Impressionism\n5. Modernism\n6. Contemporary practice',
      },
    ];

    const courseIds: Record<string, string> = {};
    for (const c of courseDefs) {
      courseIds[c.code] = (
        await first<{ id: string }>(
          pool,
          `INSERT INTO courses (code, title, description, department_id, lecturer_id, credit_units, semester, outline)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (code) DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             department_id = EXCLUDED.department_id,
             lecturer_id = EXCLUDED.lecturer_id,
             credit_units = EXCLUDED.credit_units,
             semester = EXCLUDED.semester,
             outline = EXCLUDED.outline,
             is_active = true
           RETURNING id`,
          [c.code, c.title, c.description, departmentIds[c.dept], lecturer.id, c.units, c.semester, c.outline],
        )
      ).id;
    }

    // ---- Enrollments ----------------------------------------------------------
    for (const id of Object.values(courseIds)) {
      await pool.query(
        `INSERT INTO enrollments (student_id, course_id)
         VALUES ($1, $2)
         ON CONFLICT (student_id, course_id) DO UPDATE SET status = 'active'`,
        [student.id, id],
      );
    }

    // ---- Reset child data for a clean, re-runnable seed -----------------------
    const courseIdList = Object.values(courseIds);
    await pool.query(
      `DELETE FROM submission_history
        WHERE submission_id IN (
          SELECT s.id FROM submissions s
          JOIN assignments a ON a.id = s.assignment_id
          WHERE a.course_id = ANY($1::uuid[]))`,
      [courseIdList],
    );
    await pool.query(
      `DELETE FROM submissions
        WHERE assignment_id IN (SELECT id FROM assignments WHERE course_id = ANY($1::uuid[]))`,
      [courseIdList],
    );
    await pool.query(
      `DELETE FROM quiz_attempts
        WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id = ANY($1::uuid[]))`,
      [courseIdList],
    );
    await pool.query(
      `DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id = ANY($1::uuid[]))`,
      [courseIdList],
    );
    await pool.query(`DELETE FROM quizzes WHERE course_id = ANY($1::uuid[])`, [courseIdList]);
    await pool.query(`DELETE FROM assignments WHERE course_id = ANY($1::uuid[])`, [courseIdList]);
    await pool.query(`DELETE FROM materials WHERE course_id = ANY($1::uuid[])`, [courseIdList]);
    await pool.query(`DELETE FROM exams WHERE course_id = ANY($1::uuid[])`, [courseIdList]);
    await pool.query(`DELETE FROM announcements WHERE course_id = ANY($1::uuid[])`, [courseIdList]);
    await pool.query(`DELETE FROM notifications WHERE user_id = ANY($1::uuid[])`, [
      [student.id, lecturer.id],
    ]);
    await pool.query(`DELETE FROM performance_snapshots WHERE student_id = $1`, [student.id]);

    // ---- Materials ------------------------------------------------------------
    type MaterialDef = {
      course: string;
      title: string;
      type: 'pdf' | 'pptx' | 'notes';
      size: number;
    };
    const materialDefs: MaterialDef[] = [
      { course: 'CS402', title: 'Lecture 1 — Asymptotic Analysis', type: 'pdf', size: 2_400_000 },
      { course: 'CS402', title: 'Recursion & Backtracking Notes', type: 'notes', size: 180_000 },
      { course: 'CS301', title: 'Introduction to SQL', type: 'pdf', size: 1_800_000 },
      { course: 'CS301', title: 'Normalization Slides', type: 'pptx', size: 3_100_000 },
      { course: 'DH210', title: 'Corpus Analysis Overview', type: 'pdf', size: 920_000 },
      { course: 'ARTS120', title: 'Week 1 — Baroque Slides', type: 'pptx', size: 5_200_000 },
    ];
    for (const m of materialDefs) {
      await pool.query(
        `INSERT INTO materials (course_id, uploaded_by, title, type, storage_key, file_size_bytes, version, is_current)
         VALUES ($1, $2, $3, $4, $5, $6, 1, true)`,
        [
          courseIds[m.course],
          lecturer.id,
          m.title,
          m.type,
          `materials/${m.course.toLowerCase()}/${m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${m.type}`,
          m.size,
        ],
      );
    }

    // ---- Assignments ----------------------------------------------------------
    type AssignmentDef = {
      course: string;
      title: string;
      instructions: string;
      deadlineDays: number;
      allowLate: boolean;
    };
    const assignmentDefs: AssignmentDef[] = [
      {
        course: 'CS402',
        title: 'Lab 0 — Toolchain Setup',
        instructions: 'Install the required toolchain and submit a one-page setup report.',
        deadlineDays: -14,
        allowLate: false,
      },
      {
        course: 'CS402',
        title: 'Assignment 1 — Sorting Analysis',
        instructions:
          'Implement insertion sort, merge sort and quicksort; measure and compare their empirical runtimes on n = 10^3..10^6.',
        deadlineDays: -6,
        allowLate: false,
      },
      {
        course: 'CS402',
        title: 'Assignment 2 — Graph Traversal',
        instructions:
          'Implement BFS and DFS on a weighted graph and use them to solve a shortest-path problem of your choosing. Submit code plus a short report.',
        deadlineDays: 5,
        allowLate: true,
      },
      {
        course: 'CS301',
        title: 'Assignment 1 — ER Diagram Design',
        instructions:
          'Design an entity-relationship model for a library management system. Include entities, relationships, and cardinalities.',
        deadlineDays: -3,
        allowLate: false,
      },
      {
        course: 'CS301',
        title: 'Assignment 2 — SQL Query Practice',
        instructions:
          'Complete the 12 SQL exercises from the course handout. Submit a single .sql file with your answers.',
        deadlineDays: 7,
        allowLate: true,
      },
      {
        course: 'DH210',
        title: 'Lab Report 1 — Corpus Analysis',
        instructions:
          'Run the provided tokenisation and frequency pipeline on the assigned corpus and interpret the top 20 terms.',
        deadlineDays: -2,
        allowLate: false,
      },
      {
        course: 'ARTS120',
        title: 'Essay 1 — Baroque vs Rococo',
        instructions:
          'Write a 1,500-word compare-and-contrast essay on Baroque and Rococo aesthetics, referencing at least three artworks.',
        deadlineDays: 10,
        allowLate: true,
      },
    ];
    const assignmentIds: Record<string, string> = {};
    for (const a of assignmentDefs) {
      const key = `${a.course}|${a.title}`;
      assignmentIds[key] = (
        await first<{ id: string }>(
          pool,
          `INSERT INTO assignments (course_id, created_by, title, instructions, max_score, deadline_at, allow_late_submission)
           VALUES ($1, $2, $3, $4, 100, $5, $6)
           RETURNING id`,
          [courseIds[a.course], lecturer.id, a.title, a.instructions, daysFromNow(a.deadlineDays), a.allowLate],
        )
      ).id;
    }

    // ---- Submissions (graded + pending) ---------------------------------------
    type SubmissionDef = {
      assignmentKey: string;
      submittedDaysAgo: number;
      score: number | null;
      feedback: string | null;
      gradedDaysAgo: number | null;
    };
    const submissionDefs: SubmissionDef[] = [
      {
        assignmentKey: 'CS402|Assignment 1 — Sorting Analysis',
        submittedDaysAgo: 6,
        score: 85,
        feedback:
          'Strong analysis. Watch out for best-case assumptions in your quicksort measurements — consider randomised pivot variance.',
        gradedDaysAgo: 5,
      },
      {
        assignmentKey: 'CS402|Assignment 2 — Graph Traversal',
        submittedDaysAgo: 1,
        score: null,
        feedback: null,
        gradedDaysAgo: null,
      },
      {
        assignmentKey: 'CS301|Assignment 1 — ER Diagram Design',
        submittedDaysAgo: 3,
        score: 92,
        feedback: 'Excellent model. Consider adding an explicit relation for borrow history.',
        gradedDaysAgo: 2,
      },
      {
        assignmentKey: 'DH210|Lab Report 1 — Corpus Analysis',
        submittedDaysAgo: 2,
        score: 74,
        feedback: 'Good effort; the frequency table is accurate but the interpretation needs more depth.',
        gradedDaysAgo: 1,
      },
    ];
    for (const s of submissionDefs) {
      const submission = await first<{ id: string }>(
        pool,
        `INSERT INTO submissions
           (assignment_id, student_id, storage_key, submitted_at, is_late, score, feedback, graded_by, graded_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          assignmentIds[s.assignmentKey],
          student.id,
          `submissions/${s.assignmentKey.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
          daysFromNow(-s.submittedDaysAgo),
          false,
          s.score,
          s.feedback,
          s.gradedDaysAgo != null ? lecturer.id : null,
          s.gradedDaysAgo != null ? daysFromNow(-s.gradedDaysAgo) : null,
        ],
      );
      await pool.query(
        `INSERT INTO submission_history (submission_id, storage_key, submitted_at) VALUES ($1, $2, $3)`,
        [submission.id, `submissions/${s.assignmentKey.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`, daysFromNow(-s.submittedDaysAgo)],
      );
    }

    // ---- Quizzes + questions + attempts ---------------------------------------
    type QuestionDef = {
      text: string;
      type: 'mcq' | 'true_false';
      options: string[] | null;
      correct: string;
      points: number;
    };
    type QuizDef = {
      course: string;
      title: string;
      timeLimitMinutes: number;
      availableFromDays: number;
      availableUntilDays: number;
      questions: QuestionDef[];
      attempt?: {
        submittedDaysAgo: number;
        wrongIndexes: number[];
      };
    };
    const quizDefs: QuizDef[] = [
      {
        course: 'CS402',
        title: 'Quiz 1 — Complexity Fundamentals',
        timeLimitMinutes: 15,
        availableFromDays: -7,
        availableUntilDays: 30,
        attempt: { submittedDaysAgo: 5, wrongIndexes: [3] },
        questions: [
          { text: 'What is the worst-case time complexity of merge sort?', type: 'mcq', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], correct: 'O(n log n)', points: 2 },
          { text: 'Big-O notation describes:', type: 'mcq', options: ['An upper bound on growth', 'An exact running time', 'A lower bound on growth', 'The average case'], correct: 'An upper bound on growth', points: 2 },
          { text: 'Binary search requires the input to be:', type: 'mcq', options: ['Sorted', 'Small', 'Randomised', 'Hashed'], correct: 'Sorted', points: 2 },
          { text: 'Which of the following is not a divide-and-conquer algorithm?', type: 'mcq', options: ['Merge sort', 'Quicksort', 'Binary search', 'Linear scan'], correct: 'Linear scan', points: 2 },
          { text: 'The master theorem applies to divide-and-conquer recurrences.', type: 'true_false', options: null, correct: 'true', points: 2 },
        ],
      },
      {
        course: 'CS402',
        title: 'Quiz 2 — Advanced Data Structures',
        timeLimitMinutes: 20,
        availableFromDays: -1,
        availableUntilDays: 30,
        questions: [
          { text: 'A hash table provides ___ average-case lookup.', type: 'mcq', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], correct: 'O(1)', points: 2 },
          { text: 'A red-black tree guarantees a worst-case height of O(log n).', type: 'true_false', options: null, correct: 'true', points: 2 },
          { text: 'Which structure implements a priority queue?', type: 'mcq', options: ['Heap', 'Queue', 'Stack', 'Linked list'], correct: 'Heap', points: 2 },
          { text: 'Tries are best suited for:', type: 'mcq', options: ['String prefix queries', 'Numeric sorting', 'Graph traversal', 'Cache eviction'], correct: 'String prefix queries', points: 2 },
        ],
      },
      {
        course: 'CS301',
        title: 'Quiz 1 — Relational Model',
        timeLimitMinutes: 15,
        availableFromDays: -7,
        availableUntilDays: 20,
        attempt: { submittedDaysAgo: 4, wrongIndexes: [1] },
        questions: [
          { text: 'A primary key must be:', type: 'mcq', options: ['Unique and not null', 'Numeric', 'Short', 'Indexed'], correct: 'Unique and not null', points: 2 },
          { text: 'Which normal form removes partial dependencies?', type: 'mcq', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: '2NF', points: 2 },
          { text: 'SQL stands for Structured Query Language.', type: 'true_false', options: null, correct: 'true', points: 2 },
          { text: 'A foreign key references:', type: 'mcq', options: ['A primary key', 'A unique index', 'Any column', 'A view'], correct: 'A primary key', points: 2 },
          { text: 'A relation in the relational model is equivalent to a table.', type: 'true_false', options: null, correct: 'true', points: 2 },
        ],
      },
      {
        course: 'DH210',
        title: 'Quiz 1 — Corpus Methods',
        timeLimitMinutes: 10,
        availableFromDays: -7,
        availableUntilDays: 25,
        attempt: { submittedDaysAgo: 3, wrongIndexes: [0, 4] },
        questions: [
          { text: 'Tokenisation splits text into:', type: 'mcq', options: ['Words', 'Sentences', 'Paragraphs', 'Documents'], correct: 'Words', points: 2 },
          { text: 'Stop words are usually removed to reduce noise.', type: 'true_false', options: null, correct: 'true', points: 2 },
          { text: 'TF-IDF weighs a term by its:', type: 'mcq', options: ['Frequency across the corpus', 'Length', 'Position', 'Case'], correct: 'Frequency across the corpus', points: 2 },
          { text: 'A concordance shows a word in context.', type: 'true_false', options: null, correct: 'true', points: 2 },
          { text: 'Lemmatisation reduces words to their base form.', type: 'true_false', options: null, correct: 'true', points: 2 },
        ],
      },
      {
        course: 'ARTS120',
        title: 'Quiz 1 — Renaissance Art',
        timeLimitMinutes: 15,
        availableFromDays: -1,
        availableUntilDays: 30,
        questions: [
          { text: 'Chiaroscuro refers to:', type: 'mcq', options: ['Strong contrast between light and dark', 'Golden framing', 'Perspective lines', 'Fresco technique'], correct: 'Strong contrast between light and dark', points: 2 },
          { text: 'The Sistine Chapel ceiling was painted by:', type: 'mcq', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], correct: 'Michelangelo', points: 2 },
          { text: 'Linear perspective was developed during the Renaissance.', type: 'true_false', options: null, correct: 'true', points: 2 },
        ],
      },
    ];
    for (const q of quizDefs) {
      const quiz = await first<{ id: string }>(
        pool,
        `INSERT INTO quizzes (course_id, created_by, title, time_limit_minutes, available_from, available_until, ai_generated)
         VALUES ($1, $2, $3, $4, $5, $6, false)
         RETURNING id`,
        [
          courseIds[q.course],
          lecturer.id,
          q.title,
          q.timeLimitMinutes,
          daysFromNow(q.availableFromDays),
          daysFromNow(q.availableUntilDays),
        ],
      );

      const questionIds: string[] = [];
      for (const question of q.questions) {
        questionIds.push(
          (
            await first<{ id: string }>(
              pool,
              `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id`,
              [
                quiz.id,
                question.text,
                question.type,
                question.type === 'mcq' ? JSON.stringify(question.options) : null,
                question.correct,
                question.points,
              ],
            )
          ).id,
        );
      }

      if (q.attempt) {
        const answers: Record<string, string> = {};
        let score = 0;
        q.questions.forEach((question, i) => {
          const wrong = q.attempt!.wrongIndexes.includes(i);
          const given =
            question.type === 'true_false'
              ? wrong
                ? (question.correct === 'true' ? 'false' : 'true')
                : question.correct
              : wrong
                ? question.options![(question.options!.indexOf(question.correct) + 1) % question.options!.length]
                : question.correct;
          answers[questionIds[i]] = given;
          if (!wrong) score += question.points;
        });
        await pool.query(
          `INSERT INTO quiz_attempts (quiz_id, student_id, started_at, submitted_at, score, answers)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            quiz.id,
            student.id,
            daysFromNow(-q.attempt.submittedDaysAgo - 1),
            daysFromNow(-q.attempt.submittedDaysAgo),
            score,
            JSON.stringify(answers),
          ],
        );
      }
    }

    // ---- Exams -----------------------------------------------------------------
    type ExamDef = { course: string; title: string; scheduledDays: number; duration: number; venue: string; instructions: string };
    const examDefs: ExamDef[] = [
      { course: 'CS402', title: 'Midterm Examination', scheduledDays: 21, duration: 90, venue: 'Hall B', instructions: 'Closed book. Scientific calculators allowed.' },
      { course: 'CS301', title: 'Midterm Examination', scheduledDays: 28, duration: 90, venue: 'Hall A', instructions: 'Closed book. No electronic devices.' },
      { course: 'DH210', title: 'Project Defense', scheduledDays: 14, duration: 30, venue: 'Seminar Room 2', instructions: '10-minute presentation plus Q&A.' },
      { course: 'ARTS120', title: 'Final Essay', scheduledDays: 35, duration: 120, venue: 'Studio 1', instructions: 'Submit a 3,000-word essay on a pre-approved topic.' },
    ];
    for (const e of examDefs) {
      await pool.query(
        `INSERT INTO exams (course_id, created_by, title, scheduled_at, duration_minutes, venue, instructions)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [courseIds[e.course], lecturer.id, e.title, daysFromNow(e.scheduledDays), e.duration, e.venue, e.instructions],
      );
    }

    // ---- Announcements ----------------------------------------------------------
    type AnnouncementDef = { course: string; title: string; body: string };
    const announcementDefs: AnnouncementDef[] = [
      { course: 'CS402', title: 'Welcome to Advanced Algorithms', body: 'Check the course outline and complete Lab 0 this week. Office hours are Mondays 10:00–12:00.' },
      { course: 'CS301', title: 'Office Hours Update', body: 'Office hours move to Tuesdays and Thursdays, 14:00–16:00, starting next week.' },
      { course: 'DH210', title: 'Lab Schedule Change', body: 'This week\u2019s lab moves to Wednesday to accommodate the visiting researcher.' },
      { course: 'ARTS120', title: 'Field Trip to the National Gallery', body: 'Optional field trip on Friday. Meet at the main gate by 09:00; bring student ID.' },
    ];
    for (const a of announcementDefs) {
      await pool.query(
        `INSERT INTO announcements (course_id, posted_by, title, body) VALUES ($1, $2, $3, $4)`,
        [courseIds[a.course], lecturer.id, a.title, a.body],
      );
    }

    // ---- Notifications -----------------------------------------------------------
    type NotificationDef = {
      user: string;
      type: 'deadline_reminder' | 'new_material' | 'announcement' | 'feedback' | 'ai_study_plan' | 'system';
      title: string;
      body: string;
      read: boolean;
      daysAgo: number;
    };
    const notificationDefs: NotificationDef[] = [
      { user: 'student', type: 'feedback', title: 'Assignment graded', body: 'Dr. Kanjo Demo graded "Assignment 1 — Sorting Analysis". You scored 85/100.', read: false, daysAgo: 0 },
      { user: 'student', type: 'deadline_reminder', title: 'Assignment due soon', body: '"Assignment 2 — Graph Traversal" is due in 5 days.', read: false, daysAgo: 0 },
      { user: 'student', type: 'announcement', title: 'New announcement', body: 'CS402 — Welcome to Advanced Algorithms was posted.', read: false, daysAgo: 1 },
      { user: 'student', type: 'new_material', title: 'New material', body: 'CS402 — Lecture 1 — Asymptotic Analysis was uploaded.', read: true, daysAgo: 2 },
      { user: 'student', type: 'system', title: 'Welcome to SAGE', body: 'Your account is ready. Explore courses, tasks and analytics.', read: true, daysAgo: 7 },
      { user: 'student', type: 'deadline_reminder', title: 'Assignment due soon', body: '"Lab Report 1 — Corpus Analysis" is due tomorrow.', read: true, daysAgo: 3 },
      { user: 'lecturer', type: 'system', title: 'Weekly digest', body: '1 submission awaiting grading across your courses.', read: false, daysAgo: 0 },
      { user: 'lecturer', type: 'system', title: 'Welcome to SAGE', body: 'Your lecturer account is ready.', read: true, daysAgo: 8 },
    ];
    for (const n of notificationDefs) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [n.user === 'student' ? student.id : lecturer.id, n.type, n.title, n.body, n.read, daysFromNow(-n.daysAgo)],
      );
    }

    // ---- Performance baseline (a week ago, so risk trends have a reference) -------
    await pool.query(
      `INSERT INTO performance_snapshots
         (student_id, course_id, snapshot_date, gpa, avg_assignment_score, avg_quiz_score, risk_score, risk_level)
       VALUES ($1, NULL, $2, 3.10, 78.00, 72.00, 0.25, 'low')`,
      [student.id, daysFromNow(-7)],
    );

    await pool.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log('Seed complete.');
    // eslint-disable-next-line no-console
    console.log(`Admin login:    ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    // eslint-disable-next-line no-console
    console.log(`Student login:  ${STUDENT_EMAIL} / ${DEMO_PASSWORD}`);
    // eslint-disable-next-line no-console
    console.log(`Lecturer login: ${LECTURER_EMAIL} / ${DEMO_PASSWORD}`);
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', err);
  process.exit(1);
});
