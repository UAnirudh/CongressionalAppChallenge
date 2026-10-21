import { expect, it } from 'vitest';
import { providerConfig, providerInfo, selectedProvider } from '../src/lib/provider';

it('selects NVIDIA explicitly or from its own key without borrowing OpenAI credentials', () => {
  expect(selectedProvider({ NVIDIA_API_KEY: 'private-nvidia' })).toBe('nvidia');
  expect(
    providerConfig({
      AI_PROVIDER: 'nvidia',
      NVIDIA_API_KEY: 'private-nvidia',
      NVIDIA_MODEL: 'openai/gpt-oss-120b',
      OPENAI_API_KEY: 'other-key',
    }),
  ).toEqual({ provider: 'nvidia', key: 'private-nvidia', model: 'openai/gpt-oss-120b' });
  expect(() =>
    providerConfig({
      AI_PROVIDER: 'nvidia',
      OPENAI_API_KEY: 'other-key',
      NVIDIA_MODEL: 'openai/gpt-oss-20b',
    }),
  ).toThrow('NVIDIA interpretation is not configured');
});

it('retains explicit OpenAI configuration and rejects unknown or incomplete providers', () => {
  expect(
    providerConfig({
      AI_PROVIDER: 'openai',
      OPENAI_API_KEY: 'private-openai',
      OPENAI_MODEL: 'vision-model',
      NVIDIA_API_KEY: 'other-key',
    }).provider,
  ).toBe('openai');
  expect(() => providerConfig({ AI_PROVIDER: 'other' })).toThrow('AI_PROVIDER');
  expect(() => providerConfig({ NVIDIA_API_KEY: 'private-nvidia' })).toThrow('not configured');
  expect(() =>
    providerConfig({ NVIDIA_API_KEY: 'private-nvidia', NVIDIA_MODEL: 'vision-model' }),
  ).toThrow('NVIDIA_MODEL');
});

it('publishes only accurate provider capabilities, never credentials', () => {
  const info = providerInfo({
    AI_PROVIDER: 'nvidia',
    NVIDIA_API_KEY: 'private-nvidia',
    NVIDIA_MODEL: 'openai/gpt-oss-20b',
  });
  expect(info).toEqual({ name: 'NVIDIA', supportsImages: false });
  expect(JSON.stringify(info)).not.toContain('private-nvidia');
  expect(providerInfo({ AI_PROVIDER: 'openai' })).toEqual({ name: 'OpenAI', supportsImages: true });
  expect(providerInfo({ AI_PROVIDER: 'unknown' }).supportsImages).toBe(false);
});
