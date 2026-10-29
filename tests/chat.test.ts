import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { POST } from '../src/app/api/chat/route';
import { samples } from '../src/lib/models';

beforeEach(() => {
  vi.stubEnv('AI_PROVIDER', 'openai');
  vi.stubEnv('OPENAI_API_KEY', 'test-key');
  vi.stubEnv('OPENAI_MODEL', 'test-model');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('shares one route deadline across a tutor retry', async () => {
  const repeated =
    'Horizontal speed stays constant throughout the flight because gravity only changes vertical motion.';
  const timeouts: number[] = [];
  vi.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValue(52_000);
  vi.spyOn(AbortSignal, 'timeout').mockImplementation((milliseconds) => {
    timeouts.push(milliseconds);
    return new AbortController().signal;
  });
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [{ finish_reason: 'stop', message: { content: repeated } }],
        }),
      ),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [
            {
              finish_reason: 'stop',
              message: { content: 'Gravity changes vertical speed, not horizontal speed.' },
            },
          ],
        }),
      ),
    );
  vi.stubGlobal('fetch', fetcher);

  const response = await POST(
    new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem: samples[0],
        originalQuestion: 'How far does the ball travel?',
        messages: [
          { role: 'user', content: 'Explain the motion.' },
          { role: 'assistant', content: repeated },
          { role: 'user', content: 'Why does that happen?' },
        ],
      }),
    }),
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    answer: 'Gravity changes vertical speed, not horizontal speed.',
  });
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(timeouts).toEqual([25_000, 3_000]);
});
