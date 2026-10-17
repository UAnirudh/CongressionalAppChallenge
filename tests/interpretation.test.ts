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
