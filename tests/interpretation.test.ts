import { expect, it, vi } from 'vitest';
import { interpret, readBoundedBody, validateImage } from '../src/lib/interpretation';
import { MAX_REQUEST_BYTES } from '../src/lib/upload';
import { samples } from '../src/lib/models';
import sharp from 'sharp';
const config = { key: 'test-key', model: 'test-model' };
const complete = (value: unknown) =>
  new Response(
    JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(value) } }],
    }),
  );
it.each([
  ['openai/gpt-oss-20b', 700],
  ['openai/gpt-oss-120b', 1200],
])(
  'uses NVIDIA request semantics for %s and validates final content only',
  async (model, maxTokens) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              finish_reason: 'stop',
              message: {
                reasoning_content: 'untrusted reasoning, not a model',
                content:
                  '```json\n' +
                  JSON.stringify({ status: 'supported', problem: samples[1] }) +
                  '\n```',
              },
            },
          ],
        }),
      ),
    );
    expect(
      await interpret(
        { text: 'y=2x+1' },
        { provider: 'nvidia', key: 'nvidia-test', model },
        fetcher,
      ),
    ).toEqual({ status: 'supported', problem: samples[1] });
    expect(fetcher.mock.calls[0][0]).toBe('https://integrate.api.nvidia.com/v1/chat/completions');
    const sent = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(sent).toMatchObject({
      model,
      max_tokens: maxTokens,
      reasoning_effort: 'low',
      stream: false,
    });
    expect(sent.messages[1]).toEqual({ role: 'user', content: 'y=2x+1' });
    expect(sent).not.toHaveProperty('store');
    expect(sent).not.toHaveProperty('max_completion_tokens');
    expect(sent).not.toHaveProperty('response_format');
  },
);

it('sends approved images to Groq Qwen with JSON mode and only consumes the final answer', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(complete({ status: 'supported', problem: samples[1] }));
  expect(
    await interpret(
      { text: 'Read this graph.', image: { mime: 'image/png', bytes: new Uint8Array([1, 2, 3]) } },
      { provider: 'groq', key: 'groq-test', model: 'qwen/qwen3.8-27b' },
      fetcher,
    ),
  ).toEqual({ status: 'supported', problem: samples[1] });
  expect(fetcher.mock.calls[0][0]).toBe('https://api.groq.com/openai/v1/chat/completions');
  expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer groq-test' });
  const sent = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
  expect(sent).toMatchObject({
    model: 'qwen/qwen3.8-27b',
    temperature: 0.2,
    top_p: 0.95,
    max_completion_tokens: 1200,
    reasoning_effort: 'default',
    reasoning_format: 'hidden',
    stream: false,
    response_format: { type: 'json_object' },
  });
  expect(sent.messages[1].content).toEqual([
    { type: 'text', text: 'Read this graph.' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,AQID' } },
  ]);
  expect(sent).not.toHaveProperty('store');
  expect(sent).not.toHaveProperty('max_tokens');
});

it('rejects Groq reasoning-only, truncated and invalid models without exposing raw responses', async () => {
  for (const response of [
    new Response(
      JSON.stringify({
        choices: [{ finish_reason: 'stop', message: { reasoning: 'secret reasoning' } }],
      }),
    ),
    new Response(
      JSON.stringify({ choices: [{ finish_reason: 'length', message: { content: '{}' } }] }),
    ),
    complete({ status: 'supported', problem: { ...samples[1], slope: 101 } }),
  ]) {
    await expect(
      interpret(
        { text: 'image' },
        { provider: 'groq', key: 'test', model: 'qwen/qwen3.8-27b' },
        vi.fn<typeof fetch>().mockResolvedValue(response),
      ),
    ).rejects.toThrow(/invalid or incomplete|cut off/);
  }
  for (const status of [401, 403, 429, 500]) {
    await expect(
      interpret(
        { text: 'image' },
        { provider: 'groq', key: 'test', model: 'qwen/qwen3.8-27b' },
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(new Response('private provider details', { status })),
      ),
    ).rejects.toThrow(status === 429 ? 'usage limit' : status === 500 ? 'HTTP 500' : 'credentials');
  }
});

it('reads the completed NVIDIA answer after a queued acknowledgement', async () => {
  vi.useFakeTimers();
  try {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ requestId: 'queued-id' }), { status: 202 }),
      )
      .mockResolvedValueOnce(complete({ status: 'supported', problem: samples[1] }));
    const result = interpret(
      { text: 'y=2x+1' },
      { provider: 'nvidia', key: 'test', model: 'openai/gpt-oss-20b' },
      fetcher,
    );
    await vi.advanceTimersByTimeAsync(750);
    await expect(result).resolves.toEqual({ status: 'supported', problem: samples[1] });
    expect(fetcher.mock.calls[1][0]).toBe('https://integrate.api.nvidia.com/v1/status/queued-id');
  } finally {
    vi.useRealTimers();
  }
});

it('rejects images for GPT-OSS before sending any data', async () => {
  const fetcher = vi.fn<typeof fetch>();
  await expect(
    interpret(
      { text: '', image: { mime: 'image/png', bytes: new Uint8Array([1]) } },
      { provider: 'nvidia', key: 'test', model: 'openai/gpt-oss-20b' },
      fetcher,
    ),
  ).rejects.toThrow('supports text only');
  expect(fetcher).not.toHaveBeenCalled();
});

it('handles NVIDIA credentials and quota failures without leaking provider response bodies', async () => {
  for (const status of [401, 403, 429]) {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('sensitive provider details', { status }));
    await expect(
      interpret(
        { text: 'y=2x+1' },
        { provider: 'nvidia', key: 'secret', model: 'openai/gpt-oss-20b' },
        fetcher,
      ),
    ).rejects.toThrow(status === 429 ? 'usage limit' : 'credentials');
    expect(fetcher).toHaveBeenCalledTimes(1);
  }
});
it('validates provider models and keeps credentials in the outgoing server request', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(complete({ status: 'supported', problem: samples[0] }));
  expect((await interpret({ text: 'a ball' }, config, fetcher)).status).toBe('supported');
  expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer test-key' });
});
it('preserves unsupported results honestly', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(complete({ status: 'unsupported', reason: 'Calculus is not supported.' }));
  expect(await interpret({ text: 'integrate x' }, config, fetcher)).toEqual({
    status: 'unsupported',
    reason: 'Calculus is not supported.',
  });
});
it('rejects code, unknown units, malformed JSON, truncation, and service failures', async () => {
  for (const response of [
    complete({ status: 'supported', problem: { ...samples[0], code: 'eval()' } }),
    complete({ status: 'supported', problem: { ...samples[0], velocityUnit: 'mph' } }),
    new Response('invalid'),
    new Response(JSON.stringify({ choices: [{ finish_reason: 'length' }] })),
    new Response('', { status: 429 }),
  ]) {
    await expect(
      interpret({ text: 'problem' }, config, vi.fn<typeof fetch>().mockResolvedValue(response)),
    ).rejects.toThrow();
  }
  await expect(
    interpret(
      { text: 'problem' },
      config,
      vi.fn<typeof fetch>().mockRejectedValue(new Error('network')),
    ),
  ).rejects.toThrow('could not be reached');
});
it('rejects spoofed, truncated, and oversized image files', async () => {
  await expect(validateImage(new Uint8Array([1, 2, 3]), 'image/png')).rejects.toThrow();
  await expect(validateImage(new Uint8Array(2 * 1024 * 1024 + 1), 'image/png')).rejects.toThrow();
  await expect(validateImage(new Uint8Array([255, 216, 255, 217]), 'image/jpeg')).rejects.toThrow(
    'damaged',
  );
});
it('accepts decoded PNG, JPEG, and WebP and rejects excessive decoded dimensions', async () => {
  for (const format of ['png', 'jpeg', 'webp'] as const) {
    const bytes = await sharp({ create: { width: 4, height: 4, channels: 3, background: 'white' } })
      .toFormat(format)
      .toBuffer();
    await expect(validateImage(bytes, `image/${format}`)).resolves.toBeUndefined();
  }
  const huge = await sharp({
    create: { width: 4001, height: 4000, channels: 3, background: 'white' },
  })
    .png()
    .toBuffer();
  await expect(validateImage(huge, 'image/png')).rejects.toThrow('16 megapixels');
});
it('bounds actual body size without trusting Content-Length', async () => {
  await expect(
    readBoundedBody(
      new Request('http://localhost', {
        method: 'POST',
        body: new Uint8Array(MAX_REQUEST_BYTES + 1),
      }),
    ),
  ).rejects.toThrow('too large');
});
