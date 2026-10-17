# Implementation ledger

## Agreed scope

Exactly two problem families: same-height projectile motion without drag and unitless linear functions. Text/image interpretation, model review, interactive graphs, predictions, responsive keyboard-accessible UI, tests, and a production build. No accounts, permanent upload storage, arbitrary generated code, or extra topics.

## Stage 1: foundation

Changed: package/configuration files; `src/lib/models.ts`, `src/lib/math.ts`; `tests/models.test.ts`, `tests/math.test.ts`; app shell.

Initial verification: 9 unit tests and TypeScript checking passed before the dependency tree was rebuilt. Final verification is recorded below once rerun.

Assumptions: SI projectile units; speed 0–100, angle 0–90, gravity 0.1–30; linear slope −100–100 and intercept −1000–1000. Zero-degree ground launches have zero flight time. AI extraction accuracy is separate from schema validity.

## Stage 2: learning workbench

Changed: model-review, projectile-simulator, linear-simulator, prediction, problem-workbench, UI Button/utilities; app page and styles; Playwright configuration and learning flows.

Review: source review found no actionable mathematical or state-reset defects. Both chart axes now use equal pixels per meter for projectile motion so launch angle is preserved visually. The visible view still rescales to fit the launch.

Commands: `npm run lint`, `npm run typecheck`, `npm run test:e2e`. Final browser verification passed on both desktop and mobile Chromium.

Assumptions/limitations: prediction changes clear answers; graphs are hidden during prediction; fixed physical rules remain visible independently of editable assumption notes. Linear plot covers −10 to 10 on x. Numeric entry must remain inside bounds.

## Stage 3: interpretation

Changed: `src/lib/interpretation.ts`, `src/lib/upload.ts`, `src/app/api/interpret/route.ts`, problem-input component, `.env.example`; provider and route tests.

Commands: `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.

Assumptions/limitations: OpenAI model must support vision and JSON mode. No credentials supplied during development; mocked provider tests do not establish live AI accuracy. Only explicit compatible projectile units are converted by interpretation, then canonical units are validated. Unsupported dimensions, physics, ambiguous/multiple problems, and missing essential parameters must be rejected by the interpreter. Semantic classification remains probabilistic and requires user review.

## Stage 4: final verification

Verified locally on October 16, 2026:

- `npm run lint`: passed without warnings.
- Student-readability pass: Prettier expanded source, test, and configuration formatting; `npm run format:check` is included in CI.
- `npm run typecheck`: passed.
- `npm test`: 20 tests passed across mathematics, schemas, provider adaptation, and API requests.
- `npm run build`: passed, with a static landing route and dynamic interpretation route.
- `npm run test:e2e`: 16 tests passed against the production server, across desktop and mobile Chromium. Includes main-view axe scans, numeric clearing/retyping, fractional sliders, keyboard sliders, predictions and reset, model review, mocked supported/unsupported interpretation, image consent, failure recovery, pending-state blocking, and preservation of an edited model on failure.
- `npm audit --omit=dev`: zero vulnerabilities reported.
- Full audit: five high findings in the development lint chain (`eslint-config-next` → `fast-glob` → `micromatch` → `braces`); npm suggests an incompatible major downgrade, and the registry's latest braces is still 3.0.3. No forced downgrade applied.
- Source reviews covered TypeScript math/API and React flows; numeric-editing and async-replacement findings were fixed and regression-tested.
- Screenshots were inspected on desktop and 390px mobile. Projectile text size was increased on mobile, and both physical axes use equal scales.
- Actual production HTTP request without credentials returned 503 with `Cache-Control: no-store` and the explicit missing-configuration message.

No live provider accuracy test, remote CI run, commit, push, or deployment was performed. No credentials were supplied. Automated accessibility checks are not screen-reader certification. Hosting limits and provider spending limits remain a prerequisite for a public paid endpoint.

Changed stage-4 files: accessibility/browser regression tests; `.github/workflows/ci.yml`; heading focus and pending-state fixes in workbench; string drafts in linear controls; fractional projectile sliders; image decoding in server adapter; architecture, live-verification, implementation, and continuation documentation.

## Setup incidents

The generator rejected the existing uppercase folder name; the scaffold was created directly. Overlapping dependency installs and build-triggered dependency auto-installation damaged the initial tree. It was preserved as `node_modules.install-backup` (ignored by Git, lint, and TypeScript). A fresh sequential installation pins TypeScript 5.9.3. Keep installation and build steps sequential.

This Codex shell omitted `C:\Windows\System32` from PATH. All browser assertions passed, but Playwright server teardown stalled until its server was stopped manually. Adding System32 to the current test command's PATH fixed teardown: the final 16-test run exited successfully. The README documents that environment-specific workaround. Production-mode tests also avoid dev-server screenshot timing issues.

Next.js generated the root `AGENTS.md` during development. Its installed route-handler and server/client-boundary guides were read to verify the implementation against the installed version.
