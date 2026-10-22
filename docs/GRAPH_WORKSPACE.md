# Graph workspace refinement

The user requested less generic typography, real component references such as Watermelon UI, more useful graph detail, and less surrounding interface for the two supported experiments.

## Acceptance criteria

- Use IBM Plex Sans for product text and IBM Plex Mono for numeric readouts, without the previous italic display headline.
- Replace the persistent sidebar and decorative hero with compact navigation and a short introduction. Keep input and samples accessible via New problem during exploration; preserve an edited model if new interpretation fails.
- Adapt Watermelon UI segmented tabs and data tables with source and license attribution. Keep native keyboard access, visible focus, reduced motion behavior, responsive layout, and automated accessibility checks.
- Projectile: inspect time, play/pause, show distance, height and velocity components, height/time and velocity/time views, equal distance scales for trajectory, gravity editing and presets, saved comparison, tabular data, and downloadable numeric CSV.
- Linear: inspect arbitrary x, edit x window, view intercepts and slope explanation, save a comparison, inspect tabular values, export CSV, and distinguish no x intercept from infinitely many.
- Prediction mode must hide graph results, tables, inspection results, comparisons and export until an answer is checked. Changing model parameters clears prediction feedback.
- Preserve NVIDIA GPT-OSS text interpretation, model validation, mandatory AI model review, and provider disclosure. No new model keys or providers are needed.
- Exercise desktop and phone flows, mathematical invariants, zero-duration/vertical launches, constant lines, keyboard tabs, playback, file download, and invalid numeric drafts.

## Source references

- https://ui.watermelon.sh/components/tabs and https://registry.watermelon.sh/r/tabs-1.json: inset segmented control and active surface treatment.
- https://ui.watermelon.sh/components/table and https://registry.watermelon.sh/r/table-1.json: semantic table structure, header surface, numeric alignment, hover rows, overflow region.
- https://ui.shadcn.com/docs/components/chart: grouped chart controls, accessible graph presentation and meaningful data labels.
- https://help.desmos.com/hc/en-us/articles/4406040715149-Getting-Started-Desmos-Graphing-Calculator: coordinate inspection, editable parameters and data tables as useful mathematical interactions.

Watermelon implementations are adapted to native controls and existing CSS instead of importing a second primitive framework. Full attribution is in THIRD_PARTY_NOTICES.md. No external scripts or tracking are embedded.
