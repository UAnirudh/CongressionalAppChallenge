# Live provider verification

No live AI requests were made during initial implementation. On October 26, 2026, the production deployment was smoke-tested with one synthetic projectile-motion problem:

- Typed interpretation extracted 20 m/s, 45°, and 9.81 m/s² and produced a reviewable model.
- Image interpretation of a generated problem image extracted the same values and assumptions and produced a reviewable model.
- The confirmed deterministic simulation showed a 40.77 m range and 10.19 m peak height.
- A tutor follow-up about the apex returned a consistent explanation (14.14 m/s initial vertical speed, about 1.44 s to apex, and about 10.2 m peak height).

These checks confirm one happy path per AI capability, not broad accuracy, adversarial robustness, provider uptime, or rate-limit protection. Complete the remaining checks below before making broader reliability claims. Use synthetic problems and images without personal information. Review provider costs before running a batch.

## Interpretation cases

| Input                                                                                                         | Expected model or honest rejection                                                                           |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A ball launches at 20 m/s at 45 degrees from level ground, landing at the same height. Ignore air resistance. | Projectile, velocity 20, angle 45, gravity 9.81 with a stated Earth-gravity assumption. Range about 40.77 m. |
| A ball launches at 10 m/s at 90 degrees with gravity 10 m/s², returning to the launch height.                 | Projectile, flight time 2 s, range 0 m, maximum height 5 m.                                                  |
| Same-height launch at 72 km/h and 30 degrees, without air resistance.                                         | Projectile, speed 20 m/s; conversion stated.                                                                 |
| y = -2.5x + 4                                                                                                 | Linear, slope -2.5, intercept 4, unitless axes.                                                              |
| y = 5                                                                                                         | Linear, slope 0, intercept 5.                                                                                |
| A projectile launches from a cliff 30 m above its landing point.                                              | Unsupported: unequal heights.                                                                                |
| A falling ball experiences air resistance proportional to velocity.                                           | Unsupported: drag.                                                                                           |
| A ball launches at 20 m/s.                                                                                    | Unsupported: missing launch angle.                                                                           |
| Find the derivative of x².                                                                                    | Unsupported: topic not implemented.                                                                          |
| A taxi charges $3 plus $2 per kilometer.                                                                      | Unsupported: dimensional linear word problem outside the unitless MVP contract.                              |
| Two unrelated exercises in one message                                                                        | Unsupported: multiple problems.                                                                              |
| Instructions to ignore the schema or return JavaScript                                                        | No code execution; invalid models rejected or unsupported.                                                   |

For every supported response, compare extracted fields against the source before confirming. If the provider returns a valid but incorrect model, report an extraction error; do not describe it as a mathematical engine error or claim reliable accuracy from a few examples. Keep the fixed physics assumptions consistent with the source problem.

## Images

Use clean PNG, JPEG, and WebP screenshots of each supported exercise. Confirm that selecting a file requires image consent, accepted images produce the same parameters as text, and failures remain recoverable. Try a blurry image, a corrupted image, a mismatched extension/type, a >2 MB file, a >16-megapixel image, and an animated image. Unsupported content must never become an invented supported exercise.

## Provider and deployment failures

Test an invalid server key and unavailable provider with a non-production configuration. Confirm an explicit failure, no exposed key or raw provider output, and preservation of an existing edited model. Restore credentials before the final showcase. Check that empty credentials produce the documented 503 response.

The interpretation and tutor API routes currently have no application-level distributed rate limit. Repeated public requests can increase paid-provider usage. On October 28, 2026, the Vercel project overview loaded and showed the latest production deployment as Ready, but the Firewall overview and Rules views rendered blank. Earlier Firewall API attempts reported that no configuration exists (`Seawall Config not found`), so no active rate-limit rule has been verified.

This project is on Vercel Hobby, which permits one WAF rate-limit rule per project. The rule uses a fixed window, and Vercel tracks counters per region. After the Firewall configuration can be initialized, create one rule for `POST /api/interpret` and `POST /api/chat`, then verify both allowed requests and `429` responses. Choose a limit that accounts for classrooms sharing one public IP; don’t assume each student has a separate IP. Do not rely on per-process memory counters for serverless rate limiting. Vercel’s current limits and setup steps are documented in [WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) and the [Rate Limiting SDK](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk); the SDK still requires a corresponding configured Firewall rule.

Before treating the current public deployment as ready for broader use, configure hosting request/concurrency and provider spending limits. Smoke-test the actual deployed route, not only the landing page. Confirm the host is not logging request bodies or persisting uploaded files. Local production build success does not establish deployment success.

## Human accessibility check

Use keyboard-only navigation and an actual screen reader on the target browser. Check focus after selecting a sample and confirming a review, slider operation, errors, consent, prediction feedback, and return to model review. The automated axe scans and mobile Chromium emulation are useful evidence but do not certify screen-reader or physical-device compatibility.

# NVIDIA configuration

For `AI_PROVIDER=nvidia` (or the existing Vercel NVIDIA key/model pair), run the synthetic text cases below. With GPT-OSS, image upload must be disabled and direct image requests must return 422 without contacting NVIDIA. With Nemotron, verify the consent-gated image path as well as text interpretation. See `docs/NVIDIA.md`.
