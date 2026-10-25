# ConceptLens design system

## Direction

A quiet science workspace with a warm paper palette, terracotta actions, practical notebook typography, and diagrams that invite experimentation. The shared shell covers the learning lab, exercise library, guide, and dedicated problem workspace.

## Foundations

- Canvas `#fbf4ea`, sidebar `#f1e2d0`, surface `#fffaf3`.
- Primary ink `#392d29`, secondary ink `#78665d`, terracotta action `#a9503d`.
- Borders `#e6d4c1`; parchment and muted blue distinguish surfaces and comparison graphs.
- IBM Plex Sans and IBM Plex Mono are self-hosted by Next.js for readable product text, equations and measurements. Display text has no italic accent.
- Tabular numerals are used for controls and calculated measurements.
- A shared Button primitive owns primary, outline, disabled, pressed, and focus states.

## Layout and navigation

A compact top navigation uses visible text labels on desktop and phones. The learning lab has a short introduction instead of a decorative hero. The main content has a maximum width and switches to a single column on narrow screens. The learning lab retains the original input, review, exploration, and prediction flow.

Submitting a typed problem opens a dedicated browser tab. Each problem page has Explanation, Explore, Guided exploration, and Ask the tutor sections; the original question, graph, controls, and tutor stay together. The exercise library has Physics and Math subject tabs, topic buttons, and 42 curated exercises across six topics. Only the selected topic’s problems appear, in three columns on desktop, two on tablets, and one on phones. Each exercise opens in its own browser tab with a graph and explanation, then progressive hints and a worked solution without a chatbot or AI request. The guide explains supported models, guided exploration, prediction tolerance, temporary state, and data handling. No navigation item is decorative.

## Interaction

- The input and samples move into the New problem picker during review and exploration. The active model stays visible if a new interpretation fails.
- Focus moves to the review or simulation heading on a view change, never on slider movement.
- Existing temporary numeric drafts, fractional values, pending locks, and model preservation on failed interpretation are retained.
- Graphs and controls share a panel on desktop and stack on mobile. Watermelon UI segmented tabs and semantic data-table patterns support the views; full source attribution is in THIRD_PARTY_NOTICES.md.
- Flight playback, pause-at-coordinate checkpoints, time inspection, height and velocity views, saved comparisons, gravity presets, graph point inspection, graph zoom and data export deepen the two supported experiments.
- Guided exploration uses the current model for four deterministic calculation steps, with numerical checking, progressive hints, worked steps, and an applied parameter change compared against the starting graph. It supports both lab models without another AI request. Progress survives section changes, resets on reload, and requires a restart if the model changes outside the walkthrough. Reviewed worked steps are distinguished from correctly checked answers.
- The tutor answers follow-up questions using the current problem and model, and can explain an inspected projectile point. Chat history stays in the browser tab and is sent to the configured provider only when a question is submitted.
- CSV exports use full numeric precision; on-screen values use readable rounding. All new data and inspection results are hidden during an unanswered prediction.
- Prediction mode hides graphs and calculated results until submission. Changing a variable clears prediction feedback.
- Uploads show the selected filename, explicit image consent, provider disclosure, inline errors, and a pending message.
- Decorative motion uses transforms; reduced-motion preferences disable it and smooth scrolling. Flight playback starts only after the user chooses Play and has a pause control.
- Keyboard focus is visible, the skip link reaches the main landmark, and forced colors retain control boundaries.

## Boundaries

The redesign adds no accounts, tracking, database, or persistence. Curated exercises and calculations work without an AI provider. The library includes projectile motion, motion and speed, forces and energy, linear functions, quadratics, and exponential functions. AI interpretation in the learning lab still supports projectile motion and unitless linear functions and requires the server's existing provider configuration. Current model state resets when leaving or reloading the lab.
