# NVIDIA model integration

## Configuration

The existing Vercel project has `NVIDIA_API_KEY` and `NVIDIA_MODEL` in preview and production. Keep the key in Vercel. No key is embedded in source, browser props, or build assets.

`AI_PROVIDER=nvidia` explicitly selects NVIDIA. Without an explicit provider, the presence of either `NVIDIA_API_KEY` or `NVIDIA_MODEL` selects NVIDIA; otherwise the original OpenAI path remains available. A missing NVIDIA key remains a configuration error even when OpenAI credentials exist. Selecting NVIDIA never borrows an OpenAI key or falls back to another provider on failure.

Use the exact `NVIDIA_MODEL` enabled on the account: `nvidia/nemotron-3.5-super-vl-120b-a12b`, `openai/gpt-oss-20b`, or `openai/gpt-oss-120b`. The Nemotron model accepts text and images; GPT-OSS accepts text only. The application passes the selected model through unchanged. Availability depends on NVIDIA and the account; it does not silently switch models.

## Request and validation

1. The server page passes only the provider name and image capability to the input component.
2. `/api/interpret` enforces text, request, image, and consent bounds, then resolves the server provider configuration.
3. NVIDIA uses `https://integrate.api.nvidia.com/v1/chat/completions`, `max_tokens: 4096`, and `reasoning_effort: low`. GPT-OSS receives a plain text user message. Nemotron receives text and, when provided with explicit consent, multimodal image content. NVIDIA requests omit OpenAI-specific `store` and `max_completion_tokens` options.
4. Only the completed final message is parsed. Optional JSON fences are removed; the full result must pass the existing strict Zod model schema. Separate `reasoning_content` is never returned or interpreted as the answer.
5. The student reviews all values and assumptions before simulation. The graph and prediction checks use deterministic local math.

NVIDIA calls have a 45-second deadline, the route allows 60 seconds, and the client waits up to 65 seconds. Authentication, quota, transport, malformed-output, and truncated-output failures remain explicit and preserve the existing model.

## Images

Both GPT-OSS models are text-only. In NVIDIA mode with GPT-OSS, upload is disabled with an explanation and direct image submissions receive a 422 response before provider transmission. Nemotron can interpret text and images; image submission requires the app’s explicit consent checkbox. NVIDIA documents the [Nemotron API](https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3_5-super-vl-120b-a12b-infer) and the [GPT-OSS API](https://docs.api.nvidia.com/nim/reference/openai-gpt-oss-20b-infer).

Explicit `AI_PROVIDER=openai` retains the existing image-capable adapter and consent flow. Request formats, credentials, and public capability descriptions remain separate.

## Verification

Existing unit/API coverage exercises provider selection, credential isolation, both GPT-OSS model IDs, GPT-OSS request shape and image rejection, auth/quota errors, and strict output validation. It does not verify live Nemotron calls. Provider replies in automated browser tests are stubbed; live provider verification must be recorded separately.

Primary references: [NVIDIA API](https://docs.api.nvidia.com/nim/reference/openai-gpt-oss-20b-infer), [model capabilities](https://docs.api.nvidia.com/nim/reference/openai-gpt-oss-20b).
