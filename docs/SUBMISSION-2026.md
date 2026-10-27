# Congressional App Challenge submission prep

Use this as a fact-checked draft, not a substitute for the team's own account. Replace bracketed prompts with true details and make sure every team member can explain the implementation.

## Deadline status (checked October 26, 2026)

The official [2026 rules PDF](https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf) states **October 26, 2026 at 12:00 p.m. EDT** (9:00 a.m. PDT). The official [student registration page](https://www.congressionalappchallenge.us/students/student-registration/) states **October 26, 2026 at 9:00 p.m. ET** (6:00 p.m. PDT). These official sources conflict, and both listed cutoffs have now passed. The [submission portal](https://webportalapp.com/sp/login/congressional_app_challenge_2026) remains the place to check whether an entry can still be completed; its availability does not establish that a late entry will be accepted. If the portal rejects a submission, contact the challenge administrators promptly rather than assuming an extension.

## Facts about the app

- **Name:** ConceptLens.
- **Purpose:** ConceptLens helps secondary-school students understand introductory math and physics by turning questions into editable models, interactive graphs, and practice.
- **Audience:** Students learning introductory algebra and physics, especially learners who benefit from seeing how changing a value changes a result.
- **What works without AI:** Two editable simulation models (projectile motion and unitless linear functions), prediction checks, graph inspection, and 42 curated guided exercises across six topics.
- **AI scope:** Problem interpretation supports projectile motion and unitless linear functions. Extracted values and assumptions are reviewed and editable before the simulation. AI does not write or execute simulation code. Do not imply the AI supports every exercise-library topic.
- **Implementation:** TypeScript, React, and Next.js; deterministic calculations and answer checking in TypeScript; runtime validation with Zod; graphs with Recharts; equation rendering with KaTeX; hosted on Vercel.
- **Third-party libraries:** Consult `package.json` and `THIRD_PARTY_NOTICES.md` and list the ones relevant to the submission. Include any additional tools or libraries the team used.

## Draft application answers

### Purpose (one sentence)

ConceptLens helps students understand introductory math and physics by turning a problem into an editable model they can explore through a graph, predictions, and guided practice.

### Inspiration — personalize this

Use the team's real reason for building it. A useful structure is: “We noticed **[specific learning problem you experienced or observed]**. We built ConceptLens so **[who]** could **[what they can now do]**.” Do not submit this placeholder as a personal story.

### Technical challenge — verify this reflects the team's work

One technical challenge was making AI-extracted model values safe to use in an interactive simulation. The app validates provider output against a shared Zod schema, requires students to review and edit the model, and then uses deterministic TypeScript calculations rather than executing generated code. The team should be ready to explain the schema, one calculation, and how invalid or unsupported responses are handled.

### What we learned — personalize this

Describe a specific lesson the team actually learned while building and debugging the app. Possible prompts: What did you learn about turning a word problem into a model? What was surprising about accessibility, testing, or AI validation? What did a failed test change in the design?

### What we would change in a 2.0

A possible future direction is expanding the model interpreter to additional topics while keeping the same review and validation safeguards. Name the change the team genuinely wants to build next.

## AI-use disclosure

The 2026 rules allow AI tools but require **full disclosure in the application**, significant student contributions, and technical understanding. Update this draft to include every AI tool used by every team member. Be specific about what AI did and what the students did.

Known AI assistance for this project in the current preparation:

- OpenAI Codex (GPT-6 series) reviewed product behavior and assisted with code, UI, documentation, and test changes. Students should disclose this assistance and identify which changes they reviewed or adapted.
- A local Ollama model (`qwen:latest`) provided an additional product/code critique. It did not directly edit repository files in this review.
- The app itself has AI integrations for interpreting supported math/physics questions and tutoring. Identify the actual provider/model used in the submitted demo, and distinguish that product feature from AI used during development. The deployed app discloses provider routing in its UI. On October 26, 2026, production smoke checks with one synthetic projectile-motion problem confirmed typed interpretation, image interpretation, editable model review, simulation values, and a tutor explanation. This is a narrow functional check, not an accuracy guarantee; use the deterministic sample for the recording unless the team rehearses the AI flow and is comfortable with provider latency and variability.
- Add any other AI assistants, models, image tools, coding agents, or AI-generated assets used during development. Do not claim that all code was written without AI assistance.

Suggested disclosure structure (edit to be complete and truthful):

> We used **[AI tools and models]** to help with **[specific planning, code, review, or asset tasks]**. We made the final decisions, tested and revised the work, and can explain how the app's models, calculations, validation, and interface function. The app's optional AI feature uses **[provider/model]** to suggest supported problem values; students review those values, and the app's own TypeScript calculations produce the simulation results.

## Video outline (target: about 1 minute 50 seconds)

The rules require a **public 1–3 minute** YouTube or Vimeo demo. It must include each participant's name, app name, one-sentence purpose, target audience, development tools/languages, and a functionality demo.

| Time      | Shot and narration                                                                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00–0:15 | Show the app title. Introduce **[each participant's name]** and ConceptLens. Say the purpose sentence and audience.                                                                                    |
| 0:15–0:30 | On the landing page, say the sample labs work without an account or AI call. Open **A ball in flight** and point out the editable speed, launch angle, and gravity.                                    |
| 0:30–0:55 | Confirm the model. In the simulator, point to the trajectory, range, and peak. Change one value and show the graph and measurements respond. Use a prepared, known value so the recording stays clear. |
| 0:55–1:10 | Use **Make a prediction**: enter a prediction, submit it, and show the check. Briefly inspect a point or switch to the data view.                                                                      |
| 1:10–1:28 | Open the exercise library. Show the 42 guided exercises and topic filters; open one exercise and reveal its graph, hint, or worked step.                                                               |
| 1:28–1:45 | Explain the technical challenge and solution in the students' own words: schema validation, editable review, and deterministic calculations. Name TypeScript, React, and Next.js.                      |
| 1:45–1:55 | State the AI-use disclosure clearly and close with what the team learned. Keep the final export under three minutes.                                                                                   |

### Recording checks

- Use the production site, a clean browser window, and a screen resolution that keeps controls and labels readable.
- Record the deterministic sample flow first. The AI path passed a narrow live smoke check, but still depends on provider credentials, network availability, latency, and provider responses.
- Rehearse the exact click path and reset the model before each take. Hide personal browser tabs, notifications, and account details.
- Speak the required participant names, app name, purpose, audience, tools/languages, and AI disclosure aloud; do not rely on tiny on-screen text.
- Upload to YouTube or Vimeo and verify the video is public and opens in a private/incognito window before pasting its URL into the application.

## Final portal checklist

- Confirm every team member meets the eligibility and district rules; teams may have at most four students.
- Finish the registration and eligibility steps for the correct participating district.
- Complete every application response and the AI-use disclosure.
- Paste the public video URL and test it in a signed-out browser.
- Check the portal and get explicit confirmation from challenge staff before relying on any late-submission option; the published cutoffs have passed and conflict.
- Save the submission confirmation and the exact submitted answers/video link.
