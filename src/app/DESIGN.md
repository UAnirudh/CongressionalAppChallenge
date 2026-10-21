# ConceptLens design system

## Direction

A quiet science workspace: warm ivory, forest green, editorial headlines, and diagrams that invite experimentation. The shared shell covers the learning lab, exercise library, guide, and missing-page state.

## Foundations

- Canvas `#f8f9f5`, sidebar `#f0f2eb`, surface `#ffffff`.
- Primary ink `#253a30`, secondary ink `#5d6b5b`, action green `#2e664e`.
- Borders `#dce2d6`; sage and parchment distinguish physics and mathematics exercises.
- Geist is self-hosted by Next.js; Georgia supplies the italic display accent and equations.
- Tabular numerals are used for controls and calculated measurements.
- A shared Button primitive owns primary, outline, disabled, pressed, and focus states.

## Layout and navigation

Desktop uses a persistent workspace sidebar. At 700px and below, navigation becomes a top row with visible text labels. The main content has a maximum width and switches to a single column on narrow screens. The learning lab retains the original input, review, exploration, and prediction flow.

The library opens real model reviews through `/?sample=projectile` and `/?sample=linear`. The guide explains supported models, prediction tolerance, temporary state, and data handling. No navigation item is decorative.

## Interaction

- The journey indicator follows input, review, and simulation state.
- Focus moves to the review or simulation heading on a view change, never on slider movement.
- Existing temporary numeric drafts, fractional values, pending locks, and model preservation on failed interpretation are retained.
- Graphs and controls share a panel on desktop and stack on mobile.
- Prediction mode hides graphs and calculated results until submission. Changing a variable clears prediction feedback.
- Uploads show the selected filename, explicit image consent, provider disclosure, inline errors, and a pending message.
- Motion uses opacity and transforms; reduced-motion preferences disable decorative animation and smooth scrolling.
- Keyboard focus is visible, the skip link reaches the main landmark, and forced colors retain control boundaries.

## Boundaries

The redesign adds no accounts, tracking, database, or persistence. Samples and calculations work without an AI provider. Live interpretation still requires the server's existing provider configuration. Current model state resets when leaving or reloading the lab.
