import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { POST } from '../src/app/api/interpret/route';
import { samples } from '../src/lib/models';
import sharp from 'sharp';
beforeEach(() => {
  vi.stubEnv('AI_PROVIDER', 'openai');
  vi.stubEnv('NVIDIA_API_KEY', '');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
function request(text: string) {
  const form = new FormData();
  form.set('text', text);
  return new Request('http://localhost/api/interpret', { method: 'POST', body: form });
}
it('routes configured NVIDIA requests through GPT-OSS and never falls back to OpenAI', async () => {
  vi.stubEnv('AI_PROVIDER', 'nvidia');
  vi.stubEnv('NVIDIA_API_KEY', 'test-nvidia');
  vi.stubEnv('NVIDIA_MODEL', 'openai/gpt-oss-20b');
  const fetcher = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: JSON.stringify({ status: 'supported', problem: samples[1] }) },
          },
        ],
      }),
    ),
  );
  vi.stubGlobal('fetch', fetcher);
  const response = await POST(request('y=2x+1'));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'supported', problem: samples[1] });
  expect(fetcher.mock.calls[0][0]).toBe('https://integrate.api.nvidia.com/v1/chat/completions');
  vi.stubEnv('NVIDIA_API_KEY', '');
  vi.stubEnv('OPENAI_API_KEY', 'do-not-use');
  expect((await POST(request('y=2x+1'))).status).toBe(503);
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it('rejects valid images with an actionable error when NVIDIA is selected', async () => {
  vi.stubEnv('AI_PROVIDER', 'nvidia');
  vi.stubEnv('NVIDIA_API_KEY', 'test-nvidia');
  vi.stubEnv('NVIDIA_MODEL', 'openai/gpt-oss-20b');
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'white' } })
    .png()
    .toBuffer();
  const form = new FormData();
  form.set('text', '');
  form.set('imageConsent', 'yes');
  form.set('image', new File([new Uint8Array(png)], 'problem.png', { type: 'image/png' }));
  const response = await POST(new Request('http://localhost', { method: 'POST', body: form }));
  expect(response.status).toBe(422);
  expect((await response.json()).error).toContain('text only');
  expect(fetcher).not.toHaveBeenCalled();
});
it('rejects empty input and incorrect request encoding', async () => {
  expect((await POST(request(''))).status).toBe(400);
  expect((await POST(new Request('http://localhost', { method: 'POST', body: '{}' }))).status).toBe(
    415,
  );
});
it('reports missing credentials without falling back to a fake model', async () => {
  vi.stubEnv('OPENAI_API_KEY', '');
  const response = await POST(request('y=2x+1'));
  expect(response.status).toBe(503);
  expect(await response.json()).toHaveProperty('error');
  expect(response.headers.get('cache-control')).toBe('no-store');
});
it('returns a validated provider result', async () => {
  vi.stubEnv('OPENAI_API_KEY', 'test');
  vi.stubEnv('OPENAI_MODEL', 'test');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              finish_reason: 'stop',
              message: { content: JSON.stringify({ status: 'supported', problem: samples[1] }) },
            },
          ],
        }),
      ),
    ),
  );
  const response = await POST(request('y=2x+1'));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'supported', problem: samples[1] });
});
it('requires image consent and rejects disguised images', async () => {
  const form = new FormData();
  form.set('text', '');
  form.set('image', new File(['not an image'], 'x.png', { type: 'image/png' }));
  const response = await POST(new Request('http://localhost', { method: 'POST', body: form }));
  expect(response.status).toBe(400);
  expect((await response.json()).error).toContain('Confirm');
  form.set('imageConsent', 'yes');
  expect((await POST(new Request('http://localhost', { method: 'POST', body: form }))).status).toBe(
    400,
  );
});
it('forwards an explicitly approved decoded image to the provider without writing it', async () => {
  vi.stubEnv('OPENAI_API_KEY', 'test');
  vi.stubEnv('OPENAI_MODEL', 'test');
  const fetcher = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            message: { content: JSON.stringify({ status: 'supported', problem: samples[0] }) },
          },
        ],
      }),
    ),
  );
  vi.stubGlobal('fetch', fetcher);
  const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: 'white' } })
    .png()
    .toBuffer();
  const form = new FormData();
  form.set('text', 'Read this problem.');
  form.set('imageConsent', 'yes');
  form.set('image', new File([new Uint8Array(png)], 'problem.png', { type: 'image/png' }));
  const response = await POST(new Request('http://localhost', { method: 'POST', body: form }));
  expect(response.status).toBe(200);
  const sent = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(sent.messages[1].content[1].image_url.url).toBe(
    `data:image/png;base64,${png.toString('base64')}`,
  );
  expect(sent.store).toBe(false);
});
