# Product requirements: Projectile exploration

| Field                                                          | Value                                |
| -------------------------------------------------------------- | ------------------------------------ |
| Product                                                        | ConceptLens                          |
| Feature area                                                   | Projectile motion detail page        |
| Status                                                         | Implemented; deployment not verified |
| **Audience:** Students learning introductory projectile motion |

## Summary

Make the projectile graph more useful for learning by letting students compare two launches and inspect the values at a point along a trajectory. A student can save one launch as a reference, change the model to create a second launch, and compare both paths on the same graph. They can select a point on the current path or move the flight timeline to inspect its time, position, and velocity. From that readout, they can prepare a specific follow-up question for the AI tutor.

## Problem

The existing simulator shows one trajectory and summary measurements. Students can change its variables, but they have to remember the earlier path to judge the effect of a change. The graph also does not explain the motion at a particular instant, which makes it harder to connect the curve to position and velocity equations.

## Goals

- Help students see how changing launch conditions changes the trajectory.
- Connect a visible point on the graph to time, position, and velocity values.
- Let students use those values as context for a focused tutor question.
- Keep the simulator interactive, understandable, and usable on smaller screens.

## Out of scope

- Generating custom object illustrations or stickers.
- Air resistance, changing launch or landing height, or other new physics models.
- Saving comparisons or chat history across page reloads or sessions.
- Automatically sending tutor questions without the student's action.
- Comparing linear-function graphs in this feature phase.

## Users and primary stories

**Primary user:** A student exploring a teacher-assigned or sample projectile-motion problem.

1. As a student, I want to save my current launch and change its speed or angle so I can see both paths together.
2. As a student, I want to click the path or scrub through the flight so I can read the projectile's values at a particular time.
3. As a student, I want to ask the tutor about the selected point without retyping its values.
4. As a student using a keyboard or assistive technology, I want to inspect points with the flight timeline even if clicking the graph is difficult.

## User experience

### Compare launches

1. Open the projectile-motion problem's **Graph & measurements** section.
2. Select **Save current launch as A**.
3. Adjust the model controls. The adjusted launch is B; A stays fixed.
4. Review both curves on a shared graph scale. A is dashed and labeled; B is solid and uses the current model color.
5. Use the displayed launch speed, angle, and range to understand the comparison. Update A or clear it to start over.

### Inspect a graph point

1. Click near the current solid curve, or move the flight timeline.
2. The simulator selects the corresponding time, moves the animated projectile to that point, and displays time, x/y position, and horizontal/vertical velocity.
3. The readout indicates whether the projectile is rising, falling, or at its peak.
4. Choose **Ask the tutor about this point**. The app opens the tutor section with a question containing the selected values.
5. Review or edit the question and submit it explicitly.

## Functional requirements

### Launch comparison

- **P0:** A student can capture the current projectile parameters as reference launch A.
- **P0:** Changing current speed, angle, or gravity updates launch B without changing saved A.
- **P0:** The graph overlays both trajectories and uses a common scale that fits both paths.
- **P0:** Visual styling and labels distinguish saved A from current B without relying on color alone.
- **P1:** The comparison summary shows each launch's speed, angle, and range.
- **P1:** A student can replace A with the current model or clear the comparison.
- **P1:** Comparison state is temporary to the current problem page and is not persisted.

### Point inspection and tutor handoff

- **P0:** Selecting the current curve or moving the playback timeline selects a point on the current trajectory.
- **P0:** The readout includes time in seconds, x and y position in meters, and horizontal and vertical velocity in meters per second.
- **P0:** The playhead and selected point stay synchronized; selecting a point pauses playback.
- **P0:** The timeline provides a keyboard-accessible way to select a point.
- **P1:** The interface describes vertical motion as rising, falling, or at the peak based on vertical velocity.
- **P1:** The tutor handoff includes the selected time, position, velocity components, and a request to explain their physical meaning.
- **P1:** The handoff opens the tutor section and pre-fills an editable question. It does not send until the student submits.
- **P1:** Editing projectile variables clears the selected point so the readout cannot imply that it belongs to the changed path.

## Physics and data rules

- Use the current deterministic projectile model and its existing assumptions: SI units, constant positive gravity, no air resistance, and equal launch and landing heights.
- Compute a selected point from the current model: `x = vₓt`, `y = vᵧt − ½gt²`, `vₓ = constant`, and `vᵧ(t) = vᵧ − gt`.
- Keep selected time within the model's computed flight interval.
- Keep launch A as a snapshot. Later edits to B must not mutate A.
- Do not infer a custom object shape from a problem description as part of this feature.

## Acceptance criteria

- Saving A and changing B shows two correctly labeled trajectories at one shared meter scale.
- The comparison remains stable through multiple slider changes; updating A replaces its saved values and path.
- Clicking near the current curve selects a nearby point and displays consistent position and velocity values.
- Moving the timeline updates the selected readout and graph marker; keyboard operation works through the timeline.
- Starting playback after selecting a point behaves normally, and selecting another point pauses playback at that time.
- The tutor action opens the tutor section with the selected values in an editable prompt, and the prompt is only sent after explicit submission.
- The graph and readout remain usable on mobile-width layouts, with metric values wrapping into readable columns.
- Type checking and lint pass; the feature does not add persistent storage or expose provider credentials in the browser.

## Success measures

Evaluate with task-based manual checks rather than analytics, since ConceptLens has no analytics or user accounts:

- A student can create and distinguish two trajectories without coaching.
- A student can select a point and correctly identify its position and the direction of vertical motion.
- A student can open a relevant tutor question without manually copying graph values.
- Keyboard-only users can reach the point readout through the timeline.

## Risks and mitigations

| Risk                                                               | Mitigation                                                                                                            |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Curves overlap and appear to be one path.                          | Use different line patterns and a text legend, and keep the saved/current labels visible.                             |
| A student clicks away from the curve and gets an unexpected point. | Select only when the click is near the current curve; provide the timeline as a precise alternative.                  |
| Rounded values make the tutor prompt imprecise.                    | Include units and consistent two-decimal formatting, and keep the model context available to the tutor request.       |
| A saved comparison is mistaken for permanent work.                 | Keep it page-local and label A as the saved reference for this exploration.                                           |
| Zero-angle launches do not have a distinct elevated peak.          | Avoid describing a horizontal path as rising or falling; review the phase label for this edge case during refinement. |

## Current implementation notes

The implementation includes the A/B overlay, shared graph scale, comparison controls and summary, graph-point selection, point readout, synchronized playback timeline, and tutor prompt handoff. Deployment has not been verified. See `src/components/projectile-simulator.tsx`, `src/components/problem-workbench.tsx`, and `src/components/problem-chat.tsx` for implementation details.
