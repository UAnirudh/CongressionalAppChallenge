export type AIProvider = 'openai' | 'nvidia' | 'groq';
export type ProviderConfig = { provider?: AIProvider; key: string; model: string };
export type ProviderInfo = { name: string; supportsImages: boolean; imageProviderName?: string };
type ProviderEnvironment = Readonly<Record<string, string | undefined>>;

export function selectedProvider(
  env: ProviderEnvironment = process.env,
): Exclude<AIProvider, 'groq'> {
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
    if (env.GROQ_API_KEY?.trim() || env.GROQ_MODEL?.trim())
      return {
        name: selectedProvider(env) === 'nvidia' ? 'NVIDIA' : 'OpenAI',
        supportsImages: true,
        imageProviderName: 'Groq (Qwen 3.8)',
      };
    return selectedProvider(env) === 'nvidia'
      ? { name: 'NVIDIA', supportsImages: false }
      : { name: 'OpenAI', supportsImages: true };
  } catch {
    return { name: 'the configured AI provider', supportsImages: false };
  }
}

// Image requests use their own credentials; typed problems retain the selected text provider.
// A deliberately configured but unavailable vision provider must never silently fall back.
export function imageProviderConfig(env: ProviderEnvironment = process.env): ProviderConfig {
  if (!env.GROQ_API_KEY?.trim() && !env.GROQ_MODEL?.trim()) return providerConfig(env);
  const key = env.GROQ_API_KEY?.trim();
  if (!key)
    throw new Error(
      'Groq image interpretation is not configured on this server. Type your problem or use a sample.',
    );
  const model = env.GROQ_MODEL?.trim() || 'qwen/qwen3.8-27b';
  if (model !== 'qwen/qwen3.8-27b')
    throw new Error('Set GROQ_MODEL to qwen/qwen3.8-27b for image interpretation.');
  return { provider: 'groq', key, model };
}

export function providerConfig(env: ProviderEnvironment = process.env): ProviderConfig {
  const provider = selectedProvider(env);
  const key = (provider === 'nvidia' ? env.NVIDIA_API_KEY : env.OPENAI_API_KEY)?.trim();
  const model = (provider === 'nvidia' ? env.NVIDIA_MODEL : env.OPENAI_MODEL)?.trim();
  if (!key || !model)
    throw new Error(
      `${provider === 'nvidia' ? 'NVIDIA' : 'OpenAI'} interpretation is not configured on this server. You can still explore both sample exercises.`,
    );
  if (provider === 'nvidia' && !/^openai\/gpt-oss-(20b|120b)$/.test(model))
    throw new Error('Set NVIDIA_MODEL to openai/gpt-oss-20b or openai/gpt-oss-120b.');
  return { provider, key, model };
}
