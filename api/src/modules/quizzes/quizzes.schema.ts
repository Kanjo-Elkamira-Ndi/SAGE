import { z } from 'zod';

const TRUE_FALSE_ANSWERS = ['true', 'false'];

const questionSchema = z
  .object({
    questionText: z.string().trim().min(1, 'Question text is required').max(1000),
    questionType: z.enum(['mcq', 'true_false']),
    options: z.array(z.string().trim().min(1)).min(2).max(6).optional(),
    correctAnswer: z.string().trim().min(1).max(200),
    points: z.coerce.number().int().positive().max(20).default(1),
  })
  .superRefine((question, ctx) => {
    if (question.questionType === 'true_false') {
      const normalized = question.correctAnswer.trim().toLowerCase();
      if (!TRUE_FALSE_ANSWERS.includes(normalized)) {
        ctx.addIssue({
          code: 'custom',
          path: ['correctAnswer'],
          message: 'For true_false questions the correctAnswer must be "true" or "false".',
        });
      }
    } else {
      if (!question.options || !question.options.includes(question.correctAnswer)) {
        ctx.addIssue({
          code: 'custom',
          path: ['correctAnswer'],
          message: 'correctAnswer must be one of the provided options.',
        });
      }
    }
  });

export const createQuizSchema = z.object({
  courseId: z.string().uuid('Invalid course'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  timeLimitMinutes: z.coerce.number().int().min(1).max(600).nullable().optional(),
  availableFrom: z.string().datetime({ offset: true }).optional(),
  availableUntil: z.string().datetime({ offset: true }).optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required').max(100),
  aiGenerated: z.boolean().optional().default(false),
});

export const updateQuizSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  timeLimitMinutes: z.coerce.number().int().min(1).max(600).nullable().optional(),
  availableFrom: z.string().datetime({ offset: true }).nullable().optional(),
  availableUntil: z.string().datetime({ offset: true }).nullable().optional(),
  questions: z.array(questionSchema).min(1).max(100).optional(),
  aiGenerated: z.boolean().optional(),
});

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid('Invalid question'),
        answer: z.string().trim().min(1).max(500),
      }),
    )
    .min(1, 'Submit at least one answer')
    .max(100),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;

export interface QuizQuestionDraft {
  questionText: string;
  questionType: 'mcq' | 'true_false';
  options?: string[];
  correctAnswer: string;
  points?: number;
}

export const generateQuizSchema = z.object({
  courseId: z.string().uuid('Invalid course'),
  materialId: z.string().uuid('Invalid material').optional(),
  numQuestions: z.coerce
    .number()
    .int()
    .min(1, 'At least 1 question is required')
    .max(20, 'At most 20 questions can be generated at once')
    .default(5),
});
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;

/**
 * Schema for a single generated question coming back from Groq's JSON mode.
 * Reuses the same correctness rules (options contain correctAnswer, etc.).
 */
export const generatedQuestionSchema = z
  .object({
    questionText: z.string().trim().min(1).max(1000),
    questionType: z.enum(['mcq', 'true_false']),
    options: z.array(z.string().trim().min(1)).min(2).max(6).optional(),
    correctAnswer: z.string().trim().min(1).max(200),
    points: z.coerce.number().int().min(1).max(20).default(1),
  })
  .superRefine((question, ctx) => {
    if (question.questionType === 'true_false') {
      const normalized = question.correctAnswer.trim().toLowerCase();
      if (normalized !== 'true' && normalized !== 'false') {
        ctx.addIssue({
          code: 'custom',
          path: ['correctAnswer'],
          message: 'For true_false questions the correctAnswer must be "true" or "false".',
        });
      }
      if (question.options) {
        ctx.addIssue({
          code: 'custom',
          path: ['options'],
          message: 'true_false questions must not include options.',
        });
      }
    } else if (question.questionType === 'mcq') {
      if (!question.options || !question.options.includes(question.correctAnswer)) {
        ctx.addIssue({
          code: 'custom',
          path: ['correctAnswer'],
          message: 'correctAnswer must be one of the provided options.',
        });
      }
    }
  });

export const groqDraftResponseSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1).max(20),
});
export type GroqDraftResponse = z.infer<typeof groqDraftResponseSchema>;
