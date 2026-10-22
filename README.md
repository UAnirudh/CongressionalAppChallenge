# ConceptLens

A student-built conceptual STEM lab for the 2026 Congressional App Challenge. The MVP supports exactly **projectile motion** and **unitless linear functions**.

## Run locally

Use Node.js 22 or 24 and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Both sample exercises work without credentials. For AI interpretation, copy `.env.example` to `.env.local`, set `AI_PROVIDER=nvidia`, `NVIDIA_API_KEY`, and `NVIDIA_MODEL`, then restart. Use the exact NVIDIA model ID enabled on your account: `openai/gpt-oss-20b` or `openai/gpt-oss-120b`. Keys stay server-side; never prefix them with `NEXT_PUBLIC_`. Existing Vercel settings with `NVIDIA_API_KEY` and `NVIDIA_MODEL` work without adding `AI_PROVIDER`.

To add image interpretation alongside NVIDIA text, set `GROQ_API_KEY` in the server environment. Images use `qwen/qwen3.8-27b` by default; optional `GROQ_MODEL` must match that exact ID. Photos, screenshots, and diagrams of supported problems go directly to Groq after explicit consent, then through editable model review. Typed problems continue to use NVIDIA. Without a Groq configuration, NVIDIA remains text-only; explicit `AI_PROVIDER=openai` retains the original image-capable adapter. Failed provider calls never fall back to another service. See [the provider architecture](docs/NVIDIA.md) and [Groq vision setup](docs/VISION.md).

If this Windows shell cannot find `taskkill.exe`, add the system tools directory for the current terminal before browser tests: `$env:Path = "$env:SystemRoot\System32;" + $env:Path`. Playwright needs it to stop its test server. Alternatively, run `npm start` in another terminal and let the tests reuse it.

```sh
npm test
npm run format:check
npm run typecheck
npm run lint
npx playwright install chromium
npm run build
npm run test:e2e
npm start
```

## How it works

1. Enter one supported problem or upload a PNG, JPEG, or WebP under 2 MB. Alternatively, open one of the two explicit sample models.
2. Review the extracted parameters, units, and assumptions. Correct values before confirming.
3. Adjust variables and compare the graph and measurements.
4. Enter prediction mode. Results stay hidden until you check your answer. Changing a variable resets the prediction.

`src/lib/models.ts` is the shared Zod contract. `src/lib/math.ts` contains only deterministic calculations and answer checking. The components never execute AI-generated code. `src/lib/interpretation.ts` sends problem data to the provider and validates its JSON; the server route validates incoming requests. A valid schema does not prove that AI read the question correctly, which is why model review is mandatory.

Projectile equations use SI units, launch and landing at the same height, no drag, and constant positive gravity. Range is horizontal displacement, angle is measured above horizontal, and launch speed is nonnegative. At zero speed or a horizontal launch from ground level, flight time and range are zero. The graph uses equal scales on both axes and resizes to fit; inspect its labels when comparing different launches.

Linear functions use `y = mx + b` with unitless axes. The displayed x window is −10 to 10. The y axis rescales. Slope and intercept may be negative, fractional, or zero within the schema bounds.

Prediction checking accepts an absolute error of `max(0.01, |answer| × 0.01)`. This avoids marking ordinary rounding as incorrect. This is an instructional tolerance, not a statistical confidence interval.

## Privacy and service limits

No accounts, database, analytics, or permanent image storage are implemented. Submitted problem text goes to the selected provider, named on the input form. NVIDIA GPT-OSS receives text only. Groq Qwen receives approved images and accompanying text when configured; the original OpenAI image adapter remains available otherwise. A separate checkbox names the image provider, and replacing an image clears consent. The OpenAI API request sets `store: false`; NVIDIA and Groq requests omit that option. Responses use `Cache-Control: no-store`. Provider processing and retention policies still apply; do not upload personal information. Do not configure hosting request-body logging. Errors never return credentials, reasoning traces, or raw provider responses.

The API bounds the incoming body while streaming and restricts text to 4,000 characters. Uploads require matching image MIME type and signature, full decoding, a 16-megapixel maximum, and a still image. Provider timeouts are 45 seconds for NVIDIA and Groq and 25 seconds for OpenAI, within a 60-second route budget. Unsupported topics, missing credentials, unavailable providers, invalid JSON, and out-of-range models produce explicit failures. Samples are deterministic local examples, never a fallback masquerading as successful AI interpretation.

## Deployment

Deploy as a Node.js Next.js application (not static export). Run `npm ci` and `npm run build`, then `npm start`; or use a Next.js-compatible host. Configure the selected provider's server environment variables in the host's secret settings for both preview and production. Allow a 60-second route duration and requests slightly over 2 MB for multipart overhead. The application writes no uploaded files and requires no persistent disk or database.

Before public deployment, configure the hosting provider's request/concurrency limits and an API spending limit. The endpoint has no identity-based quota because the MVP has no accounts. A public endpoint can incur provider costs. Never expose the key in client settings.

## Student ownership

Start by reading `models.ts`, then `math.ts`, their tests, and the UI components. Each component has one learning responsibility. The Button is a local editable shadcn/ui-style primitive using CVA and Radix Slot; styling lives in this repository. Change a known-answer test before changing a formula. Keep mathematical reasoning in the library rather than copying it into components.

Implementation stages and current verification are recorded in `docs/IMPLEMENTATION.md`. Provider-neutral continuation instructions are in `docs/CONTINUATION.md`.

See `docs/ARCHITECTURE.md` for the repository tree, model types, and data flow. Use `docs/LIVE_VERIFICATION.md` when credentials are available; mocked tests do not replace those checks.
