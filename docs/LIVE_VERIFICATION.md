# Live verification remaining

No live AI requests were made during initial implementation. Complete these checks after configuring server-side credentials. Use synthetic problems and images without personal information. Review provider costs before running a batch.

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

Deploy only after hosting request/concurrency limits and provider spending limits are configured. Smoke-test the actual deployed route, not only the landing page. Confirm the host is not logging request bodies or persisting uploaded files. Local production build success does not establish deployment success.

## Human accessibility check

Use keyboard-only navigation and an actual screen reader on the target browser. Check focus after selecting a sample and confirming a review, slider operation, errors, consent, prediction feedback, and return to model review. The automated axe scans and mobile Chromium emulation are useful evidence but do not certify screen-reader or physical-device compatibility.

# NVIDIA configuration

For `AI_PROVIDER=nvidia` (or the existing Vercel NVIDIA key/model pair), run the synthetic text cases below. GPT-OSS is text-only: image upload must be disabled in the UI, and a direct image request must return 422 without contacting NVIDIA. The image interpretation cases apply only to an explicitly configured image-capable OpenAI provider. See `docs/NVIDIA.md`.
