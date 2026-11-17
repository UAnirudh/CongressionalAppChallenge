# Showcase readiness — November 16, 2026

ConceptLens helps students understand math and physics by changing variables,
exploring interactive graphs, and checking predictions. Its learning lab supports
projectile motion and unitless linear functions, while its library offers 42
guided exercises across six topics. Students can also submit typed problems or
consent to image interpretation, review the extracted model, and explore it.

Live demo: https://anirudhaarin.vercel.app/

## Verified

- The live learning lab, projectile model, prediction checking, and a guided
  projectile exercise worked in Chromium.
- The local production build passed after updating Next.js and its ESLint config
  to 16.4.6 and refreshing affected transitive dependencies.
- 101 unit tests and 38 desktop/mobile browser tests passed. Provider responses
  in those browser tests are mocked; they do not prove live AI availability.
- Type checking, ESLint, and formatting checks passed. The dependency audit
  reported zero known vulnerabilities after the update.
- The user confirmed Hackatime is already connected on their development computer.

## Submission blocker

The production typed interpretation request for `y = -2.5x + 4` returned HTTP 504:
“The AI model took too long to interpret this problem. Try a shorter problem and
submit again.” Both the original page and the problem tab showed a recoverable
error. Current live AI interpretation, image interpretation, and tutor operation
have not been established as working.

Vercel permitted deployment inspection but denied environment-variable metadata
access with HTTP 403. This computer has no Vercel CLI authentication configured.
Do not publish a claim that the whole live application is working until the
provider path is repaired and the deployed interpretation, image, and tutor
flows pass real checks.

The gallery entry and real screenshot have been prepared in the local Capitol
checkout. The gallery pull request is intentionally held until the live blocker
is resolved. The dependency and documentation changes also need deployment
after review.
