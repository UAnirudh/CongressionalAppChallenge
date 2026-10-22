import { expect, it } from 'vitest';
import {
  imageProviderConfig,
  providerConfig,
  providerInfo,
  selectedProvider,
} from '../src/lib/provider';

it('adds Groq vision without changing the text provider or exposing either key', () => {
  const env = {
    NVIDIA_API_KEY: 'nvidia-private',
    NVIDIA_MODEL: 'openai/gpt-oss-20b',
    GROQ_API_KEY: 'groq-private',
  };
  expect(providerConfig(env).provider).toBe('nvidia');
  expect(imageProviderConfig(env)).toEqual({
    provider: 'groq',
    key: 'groq-private',
    model: 'qwen/qwen3.8-27b',
  });
  expect(providerInfo(env)).toEqual({
    name: 'NVIDIA',
    supportsImages: true,
    imageProviderName: 'Groq (Qwen 3.8)',
  });
  expect(JSON.stringify(providerInfo(env))).not.toContain('private');
});

it('validates the vision model and never borrows another provider key', () => {
  expect(() =>
    imageProviderConfig({ GROQ_MODEL: 'qwen/qwen3.8-27b', OPENAI_API_KEY: 'other' }),
  ).toThrow('Groq image interpretation is not configured');
  expect(() =>
    imageProviderConfig({ GROQ_API_KEY: 'test', GROQ_MODEL: 'text-only-model' }),
  ).toThrow('GROQ_MODEL');
  expect(
    imageProviderConfig({ OPENAI_API_KEY: 'test', OPENAI_MODEL: 'vision-model' }).provider,
  ).toBe('openai');
});

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

it('keeps NVIDIA selected when its model is configured but its key is missing', () => {
  const env = {
    NVIDIA_MODEL: 'openai/gpt-oss-20b',
    OPENAI_API_KEY: 'do-not-use',
    OPENAI_MODEL: 'other-model',
  };
  expect(providerInfo(env)).toEqual({ name: 'NVIDIA', supportsImages: false });
  expect(() => providerConfig(env)).toThrow('NVIDIA interpretation is not configured');
});
