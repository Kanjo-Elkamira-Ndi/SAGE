import { pool } from '../../config/db';
import { logActivity } from '../../lib/activity';
import { AppError } from '../../lib/errors';
import { groqChat, GROQ_QUIZ_SYSTEM_PROMPT, type GroqMessageInput } from '../../lib/groq';
import { env } from '../../config/env';
import { downloadObjectBytes, type MaterialType } from '../../lib/storage';
import { extractTextFromMaterial, truncateText } from '../../lib/material-text';
import { getCourseOrThrow, requireLecturerOwns, requireStudentEnrolled } from '../courses/courses.service';
import { getMaterialOrThrow, type MaterialRow } from '../materials/materials.service';
import { recomputeStudentSnapshotsForGrade } from '../performance/performance.service';
import type { CreateQuizInput, GenerateQuizInput, GroqDraftResponse, QuizQuestionDraft, SubmitQuizInput, UpdateQuizInput } from './quizzes.schema';
import { groqDraftResponseSchema } from './quizzes.schema';

export interface QuizRow {
  id: string;
  courseId: string;
  createdBy: string;
  title: string;
  timeLimitMinutes: number | null;
  availableFrom: Date | null;
  availableUntil: Date | null;
  aiGenerated: boolean;
  questionCount: number;
  myBestScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionRow {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'mcq' | 'true_false';
  options: string[] | null;
  correctAnswer: string;
  points: number;
}

export interface AttemptRow {
  id: string;
  quizId: string;
  studentId: string;
  startedAt: Date;
  submittedAt: Date | null;
  score: number | null;
  answers: Record<string, string> | null;
}

const QUIZ_SELECT_COLUMNS = `
  SELECT q.id, q.course_id, q.created_by, q.title, q.time_limit_minutes,
         q.available_from, q.available_until, q.ai_generated, q.created_at, q.updated_at
`;
const QUIZ_FROM = ` FROM quizzes q`;

const QUESTION_SELECT = `
  SELECT id, quiz_id, question_text, question_type, options, correct_answer, points
  FROM quiz_questions
`;

function toQuiz(row: Record<string, unknown>): QuizRow {
  return {
    id: row.id as string,
    courseId: row.course_id as string,
    createdBy: row.created_by as string,
    title: row.title as string,
    timeLimitMinutes: (row.time_limit_minutes as number | null) ?? null,
    availableFrom: (row.available_from as Date | null) ?? null,
    availableUntil: (row.available_until as Date | null) ?? null,
    aiGenerated: row.ai_generated as boolean,
    questionCount: row.question_count as number,
    myBestScore: (row.my_best_score as number | null) ?? null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

function toQuestion(row: Record<string, unknown>): QuestionRow {
  return {
    id: row.id as string,
    quizId: row.quiz_id as string,
    questionText: row.question_text as string,
    questionType: row.question_type as 'mcq' | 'true_false',
    options: (row.options as string[] | null) ?? null,
    correctAnswer: row.correct_answer as string,
    points: Number(row.points),
  };
}

function toAttempt(row: Record<string, unknown>): AttemptRow {
  return {
    id: row.id as string,
    quizId: row.quiz_id as string,
    studentId: row.student_id as string,
    startedAt: row.started_at as Date,
    submittedAt: (row.submitted_at as Date | null) ?? null,
    score: (row.score as number | null) ?? null,
    answers: (row.answers as Record<string, string> | null) ?? null,
  };
}

export async function getQuiz(quizId: string): Promise<QuizRow | null> {
  const result = await pool.query(
    `${QUIZ_SELECT_COLUMNS},
     (SELECT COUNT(*)::int FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count,
     NULL::numeric AS my_best_score${QUIZ_FROM}
     WHERE q.id = $1`,
    [quizId],
  );
  return result.rows.length ? toQuiz(result.rows[0]) : null;
}

export async function getQuizOrThrow(quizId: string): Promise<QuizRow> {
  const quiz = await getQuiz(quizId);
  if (!quiz) {
    throw new AppError('QUIZ_NOT_FOUND', 'Quiz not found.', 404);
  }
  return quiz;
}

async function getQuestions(quizId: string): Promise<QuestionRow[]> {
  const result = await pool.query(`${QUESTION_SELECT} WHERE quiz_id = $1 ORDER BY created_at`, [
    quizId,
  ]);
  return result.rows.map(toQuestion);
}

function normalizeAnswer(answer: string, isTrueFalse: boolean): string {
  const trimmed = answer.trim();
  return isTrueFalse ? trimmed.toLowerCase() : trimmed;
}

export async function listQuizzesForCourse(
  courseId: string,
  user: { id: string; role: string },
): Promise<QuizRow[]> {
  const course = await getCourseOrThrow(courseId);
  if (user.role === 'student') {
    await requireStudentEnrolled(courseId, user.id);
  } else if (user.role === 'lecturer') {
    await requireLecturerOwns(courseId, user.id);
  }

  const bestScoreSubquery =
    user.role === 'student'
      ? `,
         (SELECT qa.score FROM quiz_attempts qa
           WHERE qa.quiz_id = q.id AND qa.student_id = $2 AND qa.submitted_at IS NOT NULL
           ORDER BY qa.submitted_at DESC LIMIT 1) AS my_best_score`
      : ', NULL::numeric AS my_best_score';
  const params = user.role === 'student' ? [courseId, user.id] : [courseId];

  const result = await pool.query(
    `${QUIZ_SELECT_COLUMNS},
     (SELECT COUNT(*)::int FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count${bestScoreSubquery}${QUIZ_FROM}
     WHERE q.course_id = $1
     ORDER BY q.created_at DESC`,
    params,
  );
  return result.rows.map(toQuiz);
}

export async function createQuiz(input: CreateQuizInput, lecturerId: string): Promise<QuizRow> {
  await getCourseOrThrow(input.courseId);
  await requireLecturerOwns(input.courseId, lecturerId);
  assertWindow(input.availableFrom, input.availableUntil);

  const client = await pool.connect();
  let quizId: string;
  try {
    await client.query('BEGIN');
    const result = await client.query(
       `INSERT INTO quizzes (course_id, created_by, title, time_limit_minutes, available_from, available_until, ai_generated)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
       [
         input.courseId,
         lecturerId,
         input.title,
         input.timeLimitMinutes ?? null,
         input.availableFrom ?? null,
         input.availableUntil ?? null,
         input.aiGenerated ?? false,
       ],
     );
    quizId = result.rows[0].id;
    await insertQuestions(client, quizId, input.questions);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await logActivity({
    userId: lecturerId,
    action: 'quizzes.create',
    entityType: 'quiz',
    entityId: quizId,
    metadata: { courseId: input.courseId, title: input.title, questionCount: input.questions.length },
  });
  return (await getQuizOrThrow(quizId));
}

interface GeneratedMaterialSource {
  materialId: string;
  materialTitle: string;
  materialType: MaterialType;
  textChars: number;
}

interface GenerateDraftResult {
  questions: QuizQuestionDraft[];
  source: GeneratedMaterialSource;
  aiGenerated: true;
  note: string;
}

export async function generateQuizDraft(input: GenerateQuizInput, lecturerId: string): Promise<GenerateDraftResult> {
  await getCourseOrThrow(input.courseId);
  await requireLecturerOwns(input.courseId, lecturerId);

  const materialRow = await resolveMaterial(input);

  const bytes = await downloadObjectBytes(materialRow.storageKey);
  const fullText = await extractTextFromMaterial(materialRow.type, bytes);
  const text = truncateText(fullText);

  const { questions } = await callAndValidateGroq(text, input.numQuestions);

  return {
    questions,
    source: {
      materialId: materialRow.id,
      materialTitle: materialRow.title,
      materialType: materialRow.type,
      textChars: text.length,
    },
    aiGenerated: true,
    note: 'Draft questions generated from AI — review and edit before publishing. Nothing has been saved.',
  };
}

async function resolveMaterial(input: GenerateQuizInput): Promise<MaterialRow> {
  if (input.materialId) {
    const m = await getMaterialOrThrow(input.materialId);
    if (m.courseId !== input.courseId) {
      throw new AppError('NOT_COURSE_OWNER', 'The selected material does not belong to this course.', 403);
    }
    return m;
  }

  const result = await pool.query(
    'SELECT id FROM materials WHERE course_id = $1 AND is_current = true ORDER BY created_at DESC LIMIT 1',
    [input.courseId],
  );
  const id = result.rows[0]?.id as string | undefined;
  if (!id) {
    throw new AppError('MATERIAL_NOT_FOUND', 'No current material is available in this course to build a quiz from.', 404);
  }
  return getMaterialOrThrow(id);
}

async function callAndValidateGroq(text: string, count: number): Promise<{ questions: QuizQuestionDraft[]; validation: { attempts: number } }> {
  const messages: GroqMessageInput[] = [
    { role: 'developer', content: GROQ_QUIZ_SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: `Generate exactly ${count} quiz questions based ONLY on the material text below. Output valid JSON matching the schema in your instructions.

--- MATERIAL TEXT ---
${text}
--- END MATERIAL TEXT ---`,
    },
  ];

  let lastError: { message: string } | null = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await groqChat(messages, {
      responseFormat: { type: 'json_object' },
      temperature: 0.4,
      maxTokens: env.GROQ_MAX_TOKENS,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.text);
    } catch {
      lastError = { message: `Groq response was not valid JSON (attempt ${attempt}).` };
      if (attempt === 1) {
        messages.push({
          role: 'assistant' as const,
          content: response.text,
        });
        messages.push({
          role: 'user' as const,
          content: 'That output was not valid JSON. Please re-output a SINGLE valid JSON object with a "questions" array, and nothing else.',
        });
        continue;
      }
      throw new AppError('AI_OUTPUT_INVALID', lastError.message, 502, { response });
    }

    // Some models (e.g. Llama's JSON mode) rename keys. Normalize common
    // aliases before strict validation so the feature works across models.
    const normalized = normalizeGroqDraft(parsed);

    const checked = groqDraftResponseSchema.safeParse(normalized);
    const result: { success: boolean; data?: GroqDraftResponse; error?: unknown } = checked.success
      ? { success: true, data: checked.data }
      : { success: false, error: checked.error?.flatten() };

    if (result.success && result.data) {
      return { questions: result.data.questions, validation: { attempts: attempt } };
    }
    lastError = { message: `Generated questions failed shape validation (attempt ${attempt}).` };
    if (attempt === 1) {
      messages.push({
        role: 'assistant' as const,
        content: response.text,
      });
      messages.push({
        role: 'user' as const,
        content: `The JSON did not match the required schema. Fix every issue and re-output a valid JSON object with a "questions" array. Schema errors: ${JSON.stringify(result.error)}.`,
      });
      continue;
    }
    throw new AppError('AI_OUTPUT_INVALID', lastError.message, 502, { validationError: result.error });
  }

  throw new AppError('AI_OUTPUT_INVALID', lastError?.message ?? 'Groq output could not be validated.', 502);
}

/**
 * Maps common LLM key aliases onto the strict draft schema so a broad range of
 * models can be used. Leaves unrecognised shapes untouched so strict validation
 * still runs (and the retry loop can request corrections).
 */
export function normalizeGroqDraft(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.questions)) return raw;

  return {
    questions: obj.questions.map((q) => {
      if (!q || typeof q !== 'object' || Array.isArray(q)) return q;
      const question = q as Record<string, unknown>;

      const questionText = str(question.questionText ?? question.question ?? question.prompt ?? question.text ?? question.stem);
      const rawType = str(question.questionType ?? question.type ?? question.qtype).toLowerCase();
      const options = toOptions(question.options ?? question.choices ?? question.choice);
      const isTrueFalse =
        rawType === 'true_false' || rawType === 'boolean' || rawType === 'tf';
      const type: 'mcq' | 'true_false' = isTrueFalse ? 'true_false' : options.length > 0 ? 'mcq' : 'true_false';

      const correctAnswer = resolveCorrectAnswer(question, options);

      const normalized: Record<string, unknown> = {
        questionText,
        questionType: type,
        points: toInt(question.points ?? question.score, 1),
      };
      if (type === 'mcq') normalized.options = options;
      normalized.correctAnswer = correctAnswer;
      return normalized;
    }),
  };
}

function str(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

function toInt(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 20 ? Math.round(n) : fallback;
}

function toOptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((o) => (typeof o === 'string' ? o.trim() : o && typeof o === 'object' && 'text' in o ? str(o.text) : str(o)))
    .filter((o) => o.length > 0);
}

function resolveCorrectAnswer(question: Record<string, unknown>, options: string[]): string {
  const raw = question.correctAnswer ?? question.answer ?? question.correct ?? question.answerKey;
  if (typeof raw === 'number' && options[raw] !== undefined) return options[raw];
  if (typeof raw === 'number' && options.length > 0) return options[Math.min(raw, options.length - 1)];
  const s = str(raw);
  if (options.length > 0 && /^\d+$/.test(s)) {
    const idx = Number(s);
    if (options[idx] !== undefined) return options[idx];
  }
  return s;
}

export async function updateQuiz(
  quizId: string,
  input: UpdateQuizInput,
  lecturerId: string,
): Promise<QuizRow> {
  const quiz = await getQuizOrThrow(quizId);
  await requireLecturerOwns(quiz.courseId, lecturerId);
  assertWindow(input.availableFrom, input.availableUntil);

  const changes = Object.entries({
    title: input.title,
    time_limit_minutes: input.timeLimitMinutes,
    available_from: input.availableFrom,
    available_until: input.availableUntil,
    ai_generated: input.aiGenerated,
  }).filter(([, value]) => value !== undefined) as [string, unknown][];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (changes.length > 0) {
      const sets = changes.map(([column], index) => `${column} = $${index + 2}`);
      await client.query(`UPDATE quizzes SET ${sets.join(', ')} WHERE id = $1`, [
        quizId,
        ...changes.map(([, value]) => value ?? null),
      ]);
    }
    if (input.questions) {
      await client.query(`DELETE FROM quiz_questions WHERE quiz_id = $1`, [quizId]);
      await insertQuestions(client, quizId, input.questions);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await logActivity({
    userId: lecturerId,
    action: 'quizzes.update',
    entityType: 'quiz',
    entityId: quizId,
    metadata: { title: input.title ?? quiz.title, questionsReplaced: Boolean(input.questions) },
  });
  return (await getQuizOrThrow(quizId));
}

function assertWindow(availableFrom?: string | null, availableUntil?: string | null): void {
  if (availableFrom && availableUntil && new Date(availableUntil) <= new Date(availableFrom)) {
    throw new AppError('INVALID_WINDOW', 'availableUntil must be after availableFrom.', 400);
  }
}

async function insertQuestions(
  client: { query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }> },
  quizId: string,
  questions: QuizQuestionDraft[],
): Promise<void> {
  for (const question of questions) {
    await client.query(
      `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        quizId,
        question.questionText,
        question.questionType,
        question.questionType === 'mcq' ? JSON.stringify(question.options ?? []) : null,
        question.correctAnswer,
        question.points ?? 1,
      ],
    );
  }
}

function assertQuizWindow(quiz: QuizRow, at: Date): void {
  if (quiz.availableFrom && at < quiz.availableFrom) {
    throw new AppError('QUIZ_NOT_AVAILABLE', 'This quiz has not opened yet.', 403);
  }
  if (quiz.availableUntil && at > quiz.availableUntil) {
    throw new AppError('QUIZ_CLOSED', 'This quiz has closed.', 403);
  }
}

export async function startAttempt(
  quizId: string,
  studentId: string,
): Promise<{
  attemptId: string;
  startedAt: Date;
  timeLimitMinutes: number | null;
  questions: { id: string; questionText: string; questionType: string; options: string[] | null; points: number }[];
}> {
  const quiz = await getQuizOrThrow(quizId);
  await requireStudentEnrolled(quiz.courseId, studentId);
  const now = new Date();
  assertQuizWindow(quiz, now);

  const existing = await pool.query(
    `SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND student_id = $2`,
    [quizId, studentId],
  );
  const inProgress = existing.rows.find((row) => !row.submitted_at);
  if (inProgress) {
    return attemptPayload(quiz, toAttempt(inProgress), await getQuestions(quizId));
  }
  if (existing.rows.length > 0) {
    throw new AppError('QUIZ_ALREADY_ATTEMPTED', 'You have already submitted this quiz.', 409);
  }

  const result = await pool.query(
    `INSERT INTO quiz_attempts (quiz_id, student_id, started_at) VALUES ($1, $2, now()) RETURNING *`,
    [quizId, studentId],
  );
  return attemptPayload(quiz, toAttempt(result.rows[0]), await getQuestions(quizId));
}

function attemptPayload(
  quiz: QuizRow,
  attempt: AttemptRow,
  questions: QuestionRow[],
): {
  attemptId: string;
  startedAt: Date;
  timeLimitMinutes: number | null;
  questions: { id: string; questionText: string; questionType: string; options: string[] | null; points: number }[];
} {
  return {
    attemptId: attempt.id,
    startedAt: attempt.startedAt,
    timeLimitMinutes: quiz.timeLimitMinutes,
    questions: questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.questionType === 'mcq' ? q.options : null,
      points: q.points,
    })),
  };
}

export async function submitAttempt(
  quizId: string,
  studentId: string,
  input: SubmitQuizInput,
): Promise<{
  attemptId: string;
  score: number;
  total: number;
  correctCount: number;
  questionCount: number;
  timeUsedSeconds: number;
  results: { questionId: string; correct: boolean; yourAnswer: string; correctAnswer: string; points: number }[];
}> {
  const quiz = await getQuizOrThrow(quizId);
  const attempt = await getInProgressAttempt(quizId, studentId);
  const questions = await getQuestions(quizId);

  if (quiz.timeLimitMinutes) {
    const limitMs = quiz.timeLimitMinutes * 60_000;
    if (new Date().getTime() > attempt.startedAt.getTime() + limitMs) {
      throw new AppError('QUIZ_TIME_EXPIRED', 'Time limit exceeded — the attempt was auto-submitted.', 403);
    }
  }

  const byId = new Map(questions.map((q) => [q.id, q]));
  for (const answer of input.answers) {
    if (!byId.has(answer.questionId)) {
      throw new AppError('INVALID_QUESTION', 'Answer references a question that is not part of this quiz.', 400);
    }
  }

  const answersMap: Record<string, string> = {};
  let score = 0;
  let total = 0;
  let correctCount = 0;
  const results: {
    questionId: string;
    correct: boolean;
    yourAnswer: string;
    correctAnswer: string;
    points: number;
  }[] = [];

  for (const question of questions) {
    const given = input.answers.find((a) => a.questionId === question.id)?.answer ?? '';
    const isTrueFalse = question.questionType === 'true_false';
    const correct =
      given !== '' && normalizeAnswer(given, isTrueFalse) === normalizeAnswer(question.correctAnswer, isTrueFalse);
    answersMap[question.id] = given;
    total += question.points;
    if (correct) {
      score += question.points;
      correctCount += 1;
    }
    results.push({
      questionId: question.id,
      correct,
      yourAnswer: given,
      correctAnswer: question.correctAnswer,
      points: question.points,
    });
  }

  await pool.query(
    `UPDATE quiz_attempts SET submitted_at = now(), score = $1, answers = $2 WHERE id = $3`,
    [score, JSON.stringify(answersMap), attempt.id],
  );
  await logActivity({
    userId: studentId,
    action: 'quizzes.submit',
    entityType: 'quiz',
    entityId: quizId,
    metadata: { attemptId: attempt.id, score, total, correctCount },
  });
  void recomputeStudentSnapshotsForGrade(studentId, quiz.courseId);

  return {
    attemptId: attempt.id,
    score,
    total,
    correctCount,
    questionCount: questions.length,
    timeUsedSeconds: Math.round((new Date().getTime() - attempt.startedAt.getTime()) / 1000),
    results,
  };
}

async function getInProgressAttempt(quizId: string, studentId: string): Promise<AttemptRow> {
  const result = await pool.query(
    `SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND student_id = $2 AND submitted_at IS NULL`,
    [quizId, studentId],
  );
  if (!result.rows.length) {
    throw new AppError('QUIZ_ATTEMPT_NOT_FOUND', 'No in-progress attempt for this quiz.', 404);
  }
  return toAttempt(result.rows[0]);
}

export async function getResults(
  quizId: string,
  studentId: string,
): Promise<{
  quizId: string;
  title: string;
  attemptId: string;
  startedAt: Date;
  submittedAt: Date;
  score: number;
  total: number;
  correctCount: number;
  questionCount: number;
  timeUsedSeconds: number;
  questions: {
    id: string;
    questionText: string;
    questionType: string;
    options: string[] | null;
    points: number;
    correctAnswer: string;
    yourAnswer: string;
    correct: boolean;
  }[];
}> {
  const quiz = await getQuizOrThrow(quizId);
  await requireStudentEnrolled(quiz.courseId, studentId);
  const questions = await getQuestions(quizId);
  const attemptResult = await pool.query(
    `SELECT * FROM quiz_attempts
      WHERE quiz_id = $1 AND student_id = $2 AND submitted_at IS NOT NULL
      ORDER BY submitted_at DESC LIMIT 1`,
    [quizId, studentId],
  );
  if (!attemptResult.rows.length) {
    throw new AppError('QUIZ_NOT_TAKEN', 'You have not taken this quiz yet.', 404);
  }
  const attempt = toAttempt(attemptResult.rows[0]);
  const answersMap = attempt.answers ?? {};

  let total = 0;
  let correctCount = 0;
  for (const q of questions) {
    total += q.points;
    const given = answersMap[q.id] ?? '';
    const isTrueFalse = q.questionType === 'true_false';
    if (given !== '' && normalizeAnswer(given, isTrueFalse) === normalizeAnswer(q.correctAnswer, isTrueFalse)) {
      correctCount += 1;
    }
  }

  return {
    quizId: quiz.id,
    title: quiz.title,
    attemptId: attempt.id,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt as Date,
    score: Number(attempt.score),
    total,
    correctCount,
    questionCount: questions.length,
    timeUsedSeconds: Math.round((attempt.submittedAt!.getTime() - attempt.startedAt.getTime()) / 1000),
    questions: questions.map((q) => {
      const given = answersMap[q.id] ?? '';
      const isTrueFalse = q.questionType === 'true_false';
      return {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        points: q.points,
        correctAnswer: q.correctAnswer,
        yourAnswer: given,
        correct:
          given !== '' && normalizeAnswer(given, isTrueFalse) === normalizeAnswer(q.correctAnswer, isTrueFalse),
      };
    }),
  };
}
