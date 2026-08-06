import { describe, expect, it, vi } from 'vitest';
import { normalizeGroqDraft } from './quizzes.service';
import { groqDraftResponseSchema } from './quizzes.schema';

// pdf-parse runs its bundled demo when imported in ESM test environments
// (ENOENT ./test/data/05-versions-space.pdf); stub it before the module graph
// (quizzes.service -> material-text -> pdf-parse) is loaded.
const { pdfParseMock } = vi.hoisted(() => ({ pdfParseMock: vi.fn() }));
vi.mock('pdf-parse', () => ({ __esModule: true, default: pdfParseMock }));

describe('normalizeGroqDraft', () => {
  it('maps question/answer aliases and infers mcq type from options', () => {
    const raw = {
      questions: [
        {
          question: 'What does supervised learning use?',
          options: ['labeled data', 'unlabeled data', 'no data'],
          answer: 'labeled data',
        },
      ],
    };
    const out = normalizeGroqDraft(raw) as { questions: Record<string, unknown>[] };
    expect(out.questions[0]).toMatchObject({
      questionText: 'What does supervised learning use?',
      questionType: 'mcq',
      correctAnswer: 'labeled data',
      options: ['labeled data', 'unlabeled data', 'no data'],
      points: 1,
    });
    expect(groqDraftResponseSchema.safeParse(out).success).toBe(true);
  });

  it('infers true_false when no options are provided and answer is true/false', () => {
    const out = normalizeGroqDraft({
      questions: [{ question: 'Regression predicts continuous values.', answer: 'true' }],
    }) as { questions: Record<string, unknown>[] };
    expect(out.questions[0]).toMatchObject({ questionType: 'true_false', correctAnswer: 'true' });
    expect(out.questions[0].options).toBeUndefined();
    expect(groqDraftResponseSchema.safeParse(out).success).toBe(true);
  });

  it('resolves numeric answer indexes against options', () => {
    const out = normalizeGroqDraft({
      questions: [
        { questionText: 'Pick one', questionType: 'mcq', options: ['a', 'b', 'c'], answer: 1 },
      ],
    }) as { questions: Record<string, unknown>[] };
    expect(out.questions[0].correctAnswer).toBe('b');
    expect(groqDraftResponseSchema.safeParse(out).success).toBe(true);
  });

  it('honors an explicit questionType and keeps points', () => {
    const out = normalizeGroqDraft({
      questions: [
        {
          prompt: 'True or false: the sky is blue.',
          type: 'true_false',
          answer: 'false',
          score: 3,
        },
      ],
    }) as { questions: Record<string, unknown>[] };
    expect(out.questions[0]).toMatchObject({ questionType: 'true_false', correctAnswer: 'false', points: 3 });
  });

  it('returns unrecognised shapes untouched so strict validation still fails', () => {
    const raw = { notQuestions: true };
    expect(normalizeGroqDraft(raw)).toBe(raw);
    expect(normalizeGroqDraft(null)).toBeNull();
    expect(normalizeGroqDraft('x')).toBe('x');
  });
});
