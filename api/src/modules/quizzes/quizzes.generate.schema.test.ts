import { describe, expect, it } from 'vitest';
import { generatedQuestionSchema, groqDraftResponseSchema } from './quizzes.schema';

describe('generatedQuestionSchema', () => {
  it('validates a correct MCQ with matching correctAnswer', () => {
    const q = {
      questionText: 'What is 2+2?',
      questionType: 'mcq',
      options: ['3', '4', '5'],
      correctAnswer: '4',
      points: 1,
    };
    expect(generatedQuestionSchema.parse(q).correctAnswer).toBe('4');
  });

  it('rejects mcq whose correctAnswer is not in options', () => {
    expect(() =>
      generatedQuestionSchema.parse({
        questionText: 'x',
        questionType: 'mcq',
        options: ['a', 'b'],
        correctAnswer: 'z',
      }),
    ).toThrow();
  });

  it('validates a true_false question and rejects bad values', () => {
    expect(
      generatedQuestionSchema.parse({
        questionText: 'The sky is blue.',
        questionType: 'true_false',
        correctAnswer: 'true',
      }).correctAnswer,
    ).toBe('true');

    expect(() =>
      generatedQuestionSchema.parse({
        questionText: 'x',
        questionType: 'true_false',
        correctAnswer: 'maybe',
      }),
    ).toThrow();
  });

  it('rejects true_false with options present', () => {
    expect(() =>
      generatedQuestionSchema.parse({
        questionText: 'x',
        questionType: 'true_false',
        options: ['true', 'false'],
        correctAnswer: 'true',
      }),
    ).toThrow();
  });
});

describe('groqDraftResponseSchema', () => {
  it('accepts a valid response', () => {
    const ok = groqDraftResponseSchema.parse({
      questions: [
        { questionText: 'a', questionType: 'mcq', options: ['a', 'b'], correctAnswer: 'b' },
      ],
    });
    expect(ok.questions).toHaveLength(1);
  });

  it('rejects empty questions array', () => {
    expect(() => groqDraftResponseSchema.parse({ questions: [] })).toThrow();
  });
});
