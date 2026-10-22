# Groq vision

## Configuration

Set server-only `GROQ_API_KEY` in Vercel production or a local `.env.local`. No key is needed in client code. The image model defaults to `qwen/qwen3.8-27b`; optional `GROQ_MODEL` must match this exact model. Configure the key separately for preview deployments if image interpretation is needed there. The presence of a Groq key or model selects Groq for images, even when a missing key causes a configuration error. It never borrows NVIDIA or OpenAI credentials.

Typed problems retain the existing `AI_PROVIDER` selection (NVIDIA GPT-OSS or OpenAI). An image and its accompanying text are sent together only to Groq. Without Groq configuration, the original image behavior remains: OpenAI supports images, NVIDIA rejects them as text-only.

## Request and review

1. The form names the text and image services separately. Selecting or replacing an image requires fresh consent naming its recipient.
2. The server bounds multipart uploads, fully decodes PNG/JPEG/WebP, and rejects images over 2 MB, 16 megapixels, animation, and damaged files before transmission. Uploaded files are never written to disk.
3. The Groq adapter posts to `https://api.groq.com/openai/v1/chat/completions`. It sends a base64 data URI with the image's actual MIME type, plus the accompanying text and model extraction instructions. It does not fetch user-supplied URLs.
4. Parameters follow the supplied Qwen configuration: temperature 0.6, top_p 0.95, reasoning_effort default. JSON object mode and hidden reasoning keep the final output suitable for schema validation. The completion budget is 4096 tokens to allow reasoning and a complete model. Streaming is disabled so partial, unvalidated JSON never enters the simulation.
5. Only a completed final answer passing the strict shared Zod schema reaches review. Reasoning, unknown fields, malformed output, unsupported topics, ambiguous or illegible images, and out-of-range parameters cannot create a simulation automatically. Students review and edit all parameters and assumptions before exploring.

The supported models remain unitless linear functions and level-ground projectile motion. Vision does not add other math/physics topics or arbitrary graph extraction. If a diagram lacks essential values, the model must return an unsupported result rather than invent values.

## Failure and privacy behavior

Groq calls have a 45-second timeout within the route's 60-second limit. Missing keys, model configuration, authentication, quota, network, and invalid-response failures are explicit; there are no cross-provider retries. Errors do not expose raw provider responses or secrets. Responses are not cached. No permanent image storage is implemented, but Groq's processing and retention policies apply; the form discloses this before submission.

Unit/API tests verify provider routing, isolated credentials, multipart consent, multimodal payloads, strict validation, and sanitized failures. Desktop and phone browser tests verify image selection, renewed consent, review, editing, and exploration with stubbed provider responses. Live image interpretation is verified separately against production credentials.

References: [Groq Qwen model](https://console.groq.com/docs/model/qwen/qwen3.8-27b), [vision and image JSON mode](https://console.groq.com/docs/vision).
