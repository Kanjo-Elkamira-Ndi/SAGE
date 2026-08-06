import { env } from '../config/env';
import { AppError } from './errors';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export interface GroqChatResponse {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface GroqMessageInput {
  role: 'system' | 'user' | 'assistant' | 'developer';
  content: string;
}

export interface GroqChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' };
}

/**
 * Thin Groq chat-completions wrapper used only for AI quiz generation.
 * Throws `GROQ_UNAVAILABLE` when the key is missing or the API call fails.
 */
export async function groqChat(
  messages: GroqMessageInput[],
  options: GroqChatOptions = {},
): Promise<GroqChatResponse> {
  // Read live (process.env) rather than the eagerly-parsed `env` snapshot so the
  // key-check is testable via vi.stubEnv and so a missing key fails fast.
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AppError('GROQ_UNAVAILABLE', 'AI generation is not configured on this server.', 503);
  }

  const model = options.model ?? env.GROQ_MODEL;
  const temperature = options.temperature ?? env.GROQ_TEMPERATURE;
  const maxTokens = options.maxTokens ?? env.GROQ_MAX_TOKENS;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (options.responseFormat) {
    body.response_format = options.responseFormat;
  }

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AppError(
      'GROQ_UNAVAILABLE',
      `Groq request failed (HTTP ${res.status}): ${res.statusText}`,
      502,
      text,
    );
  }

  const data = (await res.json()) as {
    model?: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content ?? '';
  return {
    text: content,
    model: data.model ?? model,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

export const GROQ_QUIZ_SYSTEM_PROMPT = `You are a helpful teaching assistant that generates quiz questions from lecture materials.

You must ONLY output a single JSON object matching this schema exactly (no extra text, no preamble):
{
  "questions": [
    {
      "questionText": "string (1-1000 chars, rephased from the source material)",
      "questionType": "mcq" | "true_false",
      "options": ["a", "b", "c", "d"],  // required ONLY for "mcq"; omit for "true_false"
      "correctAnswer": "string (must be one of options for mcq; "true" or "false" for true_false)",
      "points": 1            // integer 1-20
    }
  ]
}

Rules:
- Generate exactly the number of questions requested.
- Each MCQ must have 3-6 options, and correctAnswer must be exactly one of them.
- Each "true_false" question must have correctAnswer "true" or "false" (lowercase).
- Base questions strictly on the provided material text. Do not invent facts.
- Vary question styles (definitions, applications, comparisons).`;
