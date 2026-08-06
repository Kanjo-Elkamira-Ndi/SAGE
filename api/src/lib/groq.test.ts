import { describe, expect, it, vi } from 'vitest';
import { groqChat, GROQ_QUIZ_SYSTEM_PROMPT } from './groq';
import { AppError } from './errors';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('groqChat', () => {
  it('returns parsed text, model and usage on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        model: 'llama-3.3-70b-versatile',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        choices: [{ message: { content: '{"questions":[]}' } }],
      }),
    });

    const res = await groqChat([
      { role: 'developer', content: GROQ_QUIZ_SYSTEM_PROMPT },
      { role: 'user', content: 'make questions' },
    ]);

    expect(res.text).toBe('{"questions":[]}');
    expect(res.model).toBe('llama-3.3-70b-versatile');
    expect(res.usage).toEqual({ promptTokens: 10, completionTokens: 20, totalTokens: 30 });
    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'POST' }));
  });

  it('throws GROQ_UNAVAILABLE when key is missing', async () => {
    vi.stubEnv('GROQ_API_KEY', '');
    await expect(groqChat([{ role: 'user', content: 'hi' }])).rejects.toMatchObject({
      code: 'GROQ_UNAVAILABLE',
      status: 503,
    });
  });

  it('throws GROQ_UNAVAILABLE (502) when the API returns an error', async () => {
    vi.stubEnv('GROQ_API_KEY', 'test-key');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: async () => 'rate limited',
    });
    await expect(groqChat([{ role: 'user', content: 'hi' }])).rejects.toMatchObject({
      code: 'GROQ_UNAVAILABLE',
      status: 502,
    });
  });
});
