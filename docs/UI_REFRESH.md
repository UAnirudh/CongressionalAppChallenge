# ConceptLens UI refresh

The platform now uses a shared ivory and forest-green workspace, Geist typography, editorial display accents, and consistent controls. The learning lab, exercise library, guide, model review, simulations, predictions, uploads, and missing-page view share the same design.

## Completed flows

| Flow                                          | Result                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Choose a projectile or linear exercise        | Opens an editable model review                                             |
| Open either exercise from the library         | Routes into the correct review, then simulation                            |
| Review values and assumptions                 | Preserves editable fields and fractional parameters                        |
| Adjust projectile sliders                     | Updates a graph with equal distance and height scales                      |
| Edit slope or intercept                       | Preserves temporary numeric drafts and the last valid graph                |
| Make and check a prediction                   | Hides results until submission; parameter changes reset feedback           |
| Submit a typed problem                        | Retains review, unsupported-problem, pending, and recovery behavior        |
| Select, replace, or remove an image           | Shows filename; replacement requires fresh image consent                   |
| Interpretation fails                          | Preserves the current edited model                                         |
| Navigate to the guide and privacy information | Working links with active navigation and a return to the lab               |
| Use keyboard or a narrow viewport             | Focus handoff, visible focus, readable layouts, and no horizontal overflow |

## Verification

- Production build and its TypeScript validation: passed.
- Unit/API tests: 29 passed, including NVIDIA request and configuration coverage.
- Playwright: 24 checks passed across desktop Chrome and emulated iPhone 13, including the NVIDIA text-only configuration. The multi-view desktop accessibility audit was rerun successfully with a 60-second budget for its four axe scans.
- Automated WCAG A/AA checks: passed on the lab, review, both simulators, exercise library, and guide.
- Visual/browser checks at 320, 390, 768, and 1440 pixels: no horizontal overflow or observed page errors.
- Formatting for changed files and Git whitespace checks: passed.
- Full ESLint run: zero errors or warnings. The existing error boundary now catches rendering errors and provides working recovery controls.

## Delivery boundary

This document records local verification. The release pull request records remote CI, merge, and hosted verification separately. Automated browser tests mock the interpretation provider and do not establish live provider accuracy or availability. Existing local changes were reviewed and integrated, including the provider setup and previously dormant navigation and public metadata.

See `src/app/DESIGN.md` for the visual and interaction conventions.
