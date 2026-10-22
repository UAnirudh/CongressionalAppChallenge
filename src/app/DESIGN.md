# ConceptLens design system

## Direction

A quiet science workspace: warm ivory, forest green, practical notebook typography, and diagrams that invite experimentation. The shared shell covers the learning lab, exercise library, guide, and missing-page state.

## Foundations

- Canvas `#f8f9f5`, sidebar `#f0f2eb`, surface `#ffffff`.
- Primary ink `#253a30`, secondary ink `#5d6b5b`, action green `#2e664e`.
- Borders `#dce2d6`; sage and parchment distinguish physics and mathematics exercises.
- IBM Plex Sans and IBM Plex Mono are self-hosted by Next.js for readable product text, equations and measurements. Display text has no italic accent.
- Tabular numerals are used for controls and calculated measurements.
- A shared Button primitive owns primary, outline, disabled, pressed, and focus states.

## Layout and navigation

A compact top navigation uses visible text labels on desktop and phones. The learning lab has a short introduction instead of a decorative hero. The main content has a maximum width and switches to a single column on narrow screens. The learning lab retains the original input, review, exploration, and prediction flow.

The library opens real model reviews through `/?sample=projectile` and `/?sample=linear`. The guide explains supported models, prediction tolerance, temporary state, and data handling. No navigation item is decorative.

## Interaction

- The input and samples move into the New problem picker during review and exploration. The active model stays visible if a new interpretation fails.
- Focus moves to the review or simulation heading on a view change, never on slider movement.
- Existing temporary numeric drafts, fractional values, pending locks, and model preservation on failed interpretation are retained.
- Graphs and controls share a panel on desktop and stack on mobile. Watermelon UI segmented tabs and semantic data-table patterns support the views; full source attribution is in THIRD_PARTY_NOTICES.md.
- Flight playback, time inspection, height and velocity views, saved comparisons, gravity presets, coordinate inspection, graph zoom and data export deepen the two supported experiments.
- CSV exports use full numeric precision; on-screen values use readable rounding. All new data and inspection results are hidden during an unanswered prediction.
- Prediction mode hides graphs and calculated results until submission. Changing a variable clears prediction feedback.
- Uploads show the selected filename, explicit image consent, provider disclosure, inline errors, and a pending message.
- Decorative motion uses transforms; reduced-motion preferences disable it and smooth scrolling. Flight playback starts only after the user chooses Play and has a pause control.
- Keyboard focus is visible, the skip link reaches the main landmark, and forced colors retain control boundaries.

## Boundaries

The redesign adds no accounts, tracking, database, or persistence. Samples and calculations work without an AI provider. Live interpretation still requires the server's existing provider configuration. Current model state resets when leaving or reloading the lab.
