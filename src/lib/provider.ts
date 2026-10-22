export type AIProvider = 'openai' | 'nvidia';
export type ProviderConfig = { provider?: AIProvider; key: string; model: string };
export type ProviderInfo = { name: string; supportsImages: boolean };
type ProviderEnvironment = Readonly<Record<string, string | undefined>>;

export const NVIDIA_NEMOTRON_VL_MODEL = 'nvidia/nemotron-3.5-super-vl-120b-a12b';
const nvidiaTextModels = new Set(['openai/gpt-oss-20b', 'openai/gpt-oss-120b']);

export function nvidiaModelSupportsImages(model: string | undefined) {
  return model?.trim() === NVIDIA_NEMOTRON_VL_MODEL;
}

export function selectedProvider(env: ProviderEnvironment = process.env): AIProvider {
  if (env.AI_PROVIDER) {
    if (env.AI_PROVIDER !== 'openai' && env.AI_PROVIDER !== 'nvidia')
      throw new Error('AI_PROVIDER must be openai or nvidia.');
    return env.AI_PROVIDER;
  }
  return env.NVIDIA_API_KEY || env.NVIDIA_MODEL ? 'nvidia' : 'openai';
}

// Only this public description crosses the server/client boundary. Never pass the config.
export function providerInfo(env: ProviderEnvironment = process.env): ProviderInfo {
  try {
    if (selectedProvider(env) === 'nvidia')
      return { name: 'NVIDIA', supportsImages: nvidiaModelSupportsImages(env.NVIDIA_MODEL) };
    return { name: 'OpenAI', supportsImages: true };
  } catch {
    return { name: 'the configured AI provider', supportsImages: false };
  }
}

export function providerConfig(env: ProviderEnvironment = process.env): ProviderConfig {
  const provider = selectedProvider(env);
  const key = (provider === 'nvidia' ? env.NVIDIA_API_KEY : env.OPENAI_API_KEY)?.trim();
  const model = (provider === 'nvidia' ? env.NVIDIA_MODEL : env.OPENAI_MODEL)?.trim();
  if (!key || !model)
    throw new Error(
      `${provider === 'nvidia' ? 'NVIDIA' : 'OpenAI'} interpretation is not configured on this server. You can still explore both sample exercises.`,
    );
  if (
    provider === 'nvidia' &&
    !nvidiaTextModels.has(model) &&
    model !== NVIDIA_NEMOTRON_VL_MODEL
  )
    throw new Error(
      'Set NVIDIA_MODEL to nvidia/nemotron-3.5-super-vl-120b-a12b, openai/gpt-oss-20b, or openai/gpt-oss-120b.',
    );
  return { provider, key, model };
}
