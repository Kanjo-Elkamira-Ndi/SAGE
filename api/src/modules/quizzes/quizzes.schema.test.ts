import { describe, expect, it } from 'vitest';
import { createQuizSchema, submitQuizSchema, updateQuizSchema } from './quizzes.schema';

const courseId = 'a3e1e9ee-2e9a-4e4d-9f4e-0c7b0b1b2c3d';

const mcq = {
  questionText: 'Which structure is LIFO?',
  questionType: 'mcq',
  options: ['Queue', 'Stack', 'Array', 'Tree'],
  correctAnswer: 'Stack',
  points: 2,
};

const tf = {
  questionText: 'A binary tree can have more than two children.',
  questionType: 'true_false',
  correctAnswer: 'false',
};

describe('createQuizSchema', () => {
  it('accepts a valid quiz with mcq + true_false questions', () => {
    const out = createQuizSchema.parse({
      courseId,
      title: 'Data Structures Quiz 1',
      timeLimitMinutes: 20,
      questions: [mcq, tf],
    });
    expect(out.questions.length).toBe(2);
    expect(out.questions[0].points).toBe(2);
    expect(out.questions[1].points).toBe(1);
  });

  it('rejects mcq whose correctAnswer is not in options', () => {
    expect(() =>
      createQuizSchema.parse({
        courseId,
        title: 'Bad MCQ',
        questions: [{ ...mcq, correctAnswer: 'Graph' }],
      }),
    ).toThrow();
  });

  it('rejects true_false with a non-boolean correctAnswer', () => {
    expect(() =>
      createQuizSchema.parse({
        courseId,
        title: 'Bad TF',
        questions: [{ ...tf, correctAnswer: 'maybe' }],
      }),
    ).toThrow();
  });

  it('accepts case-insensitive true_false answers', () => {
    const out = createQuizSchema.parse({
      courseId,
      title: 'TF quiz',
      questions: [{ ...tf, correctAnswer: 'TRUE' }],
    });
    expect(out.questions[0].correctAnswer).toBe('TRUE');
  });

  it('rejects empty questions array', () => {
    expect(() =>
      createQuizSchema.parse({ courseId, title: 'Empty', questions: [] }),
    ).toThrow();
  });

  it('rejects mcq with fewer than two options', () => {
    expect(() =>
      createQuizSchema.parse({
        courseId,
        title: 'One option',
        questions: [{ ...mcq, options: ['Only'] }],
      }),
    ).toThrow();
  });
});

describe('updateQuizSchema', () => {
  it('accepts replacing questions and a new window', () => {
    const out = updateQuizSchema.parse({
      title: 'Quiz 1 (updated)',
      questions: [tf],
      availableFrom: '2026-08-01T00:00:00.000Z',
      availableUntil: '2026-08-31T00:00:00.000Z',
    });
    expect(out.questions?.length).toBe(1);
  });
});

describe('submitQuizSchema', () => {
  const qId = 'c5f3fb00-4f1c-4f6f-9b6f-2e9d2c3d4e5f';

  it('accepts a list of question answers', () => {
    const out = submitQuizSchema.parse({ answers: [{ questionId: qId, answer: 'Stack' }] });
    expect(out.answers[0].answer).toBe('Stack');
  });

  it('rejects empty answers', () => {
    expect(() => submitQuizSchema.parse({ answers: [] })).toThrow();
    expect(() => submitQuizSchema.parse({})).toThrow();
  });

  it('rejects a bad questionId or empty answer', () => {
    expect(() =>
      submitQuizSchema.parse({ answers: [{ questionId: 'nope', answer: 'x' }] }),
    ).toThrow();
    expect(() =>
      submitQuizSchema.parse({ answers: [{ questionId: qId, answer: ' ' }] }),
    ).toThrow();
  });
});
