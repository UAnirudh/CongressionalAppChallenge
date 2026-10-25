'use client';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { samples, type Problem } from '@/lib/models';
import { linearValue, projectile, projectileState } from '@/lib/math';
import { ModelReview } from './model-review';
import { ProjectileSimulator } from './projectile-simulator';
import { LinearSimulator } from './linear-simulator';
import { Prediction } from './prediction';
import { Button } from './ui/button';
import { ProblemInput } from './problem-input';
import { ProblemChat } from './problem-chat';
import { GuidedExploration } from './guided-exploration';
import { Icon } from './icon';
import type { ProviderInfo } from '@/lib/provider';

const dedicatedSections = ['explanation', 'explore', 'guided', 'chat'] as const;

export function ProblemWorkbench({
  initialProblem = null,
  question,
  provider,
  dedicated = false,
  requiresReview = false,
}: {
  initialProblem?: Problem | null;
  question?: string;
  provider: ProviderInfo;
  dedicated?: boolean;
  requiresReview?: boolean;
}) {
  const [draft, setDraft] = useState<Problem | null>(
    dedicated && !requiresReview ? null : initialProblem,
  );
  const [model, setModel] = useState<Problem | null>(
    dedicated && !requiresReview ? initialProblem : null,
  );
  const [revision, setRevision] = useState(0);
  const [predicting, setPredicting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inputOpen, setInputOpen] = useState(!initialProblem);
  const [viewRevision, setViewRevision] = useState(0);
  const [dedicatedSection, setDedicatedSection] =
    useState<(typeof dedicatedSections)[number]>('explanation');
  const [tutorPrefill, setTutorPrefill] = useState<{ text: string; revision: number } | null>(null);
  const tutorPromptRevision = useRef(0);
  const output = useRef<HTMLDivElement>(null);
  const phase = model ? 'simulation' : draft ? 'review' : 'input';
  const projectileComponents =
    model?.type === 'projectile_motion'
      ? {
          horizontal: model.velocity * Math.cos((model.angle * Math.PI) / 180),
          vertical: model.velocity * Math.sin((model.angle * Math.PI) / 180),
        }
      : null;
  const projectileResults = model?.type === 'projectile_motion' ? projectile(model) : null;
  const linearAtThree = model?.type === 'linear_function' ? linearValue(model, 3) : null;
  // Move focus only when changing views, never while adjusting a variable.
  useEffect(() => {
    output.current?.querySelector('h2')?.focus();
  }, [phase, viewRevision]);
  function load(problem: Problem) {
    setInputOpen(false);
    setDraft(problem);
    setModel(null);
    setPredicting(false);
    setRevealed(false);
    setRevision((n) => n + 1);
    setViewRevision((n) => n + 1);
  }
  function change(problem: Problem) {
    setModel(problem);
    setRevealed(false);
    setRevision((n) => n + 1);
  }
  function askAboutTrajectoryPoint(point: ReturnType<typeof projectileState>) {
    const phase =
      point.vy > 0.05 ? 'rising' : point.vy < -0.05 ? 'falling' : 'at the highest point';
    const text =
      `At t = ${point.t.toFixed(2)} s, the projectile is ${phase}. ` +
      `Its position is x = ${point.x.toFixed(2)} m and y = ${point.y.toFixed(2)} m; ` +
      `its horizontal velocity is ${point.vx.toFixed(2)} m/s and ` +
      `its vertical velocity is ${point.vy.toFixed(2)} m/s. ` +
      'Explain what these values mean physically and how they follow from the motion equations.';
    setTutorPrefill({ text, revision: ++tutorPromptRevision.current });
    setDedicatedSection('chat');
  }
  function selectSection(section: (typeof dedicatedSections)[number]) {
    if (section === 'guided') {
      setPredicting(false);
      setRevealed(false);
    }
    setDedicatedSection(section);
  }
  function handleSectionTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    )
      return;
    event.preventDefault();
    const currentIndex = dedicatedSections.indexOf(dedicatedSection);
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? dedicatedSections.length - 1
          : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + dedicatedSections.length) %
            dedicatedSections.length;
    const next = dedicatedSections[nextIndex];
    selectSection(next);
    document.getElementById(`problem-tab-${next}`)?.focus();
  }
  return (
    <>
      {!dedicated && (draft || model) && (
        <div className="lab-session-bar">
          <span>{model ? 'Experiment in progress' : 'Review the values before you explore'}</span>
          <Button
            variant="outline"
            aria-expanded={inputOpen}
            aria-controls="problem-start"
            onClick={() => setInputOpen((v) => !v)}
          >
            {inputOpen ? 'Close problem picker' : 'New problem'}
          </Button>
        </div>
      )}
      {!dedicated && (
        <section
          id="problem-start"
          className="start-section"
          aria-labelledby="start-heading"
          hidden={!inputOpen}
        >
          <div className="section-heading">
            <div>
              <h2 id="start-heading" tabIndex={-1}>
                What are you working on?
              </h2>
              <p>Choose an experiment or type a problem to interpret.</p>
            </div>
          </div>
          <div className="start-grid">
            <div className="input-panel">
              <div className="panel-heading">
                <span className="square-icon">
                  <Icon name="spark" />
                </span>
                <div>
                  <h3>Start with your problem</h3>
                </div>
                <span className="small-label">YOUR QUESTION</span>
              </div>
              <ProblemInput onPending={setBusy} provider={provider} />
            </div>
            <div className="sample-panel">
              <div className="sample-panel-heading">
                <h3>Try an experiment</h3>
                <span className="small-label">QUICK START</span>
              </div>
              <div className="sample-grid">
                <button disabled={busy} className="sample" onClick={() => load(samples[0])}>
                  <span className="sample-top">
                    <span className="subject-label">PHYSICS</span>
                    <span className="sample-number">01</span>
                  </span>
                  <strong>A ball in flight</strong>
                  <span className="sample-description">
                    Launch at 20 m/s and 45°. How far does it travel?
                  </span>
                  <span className="sample-bottom">
                    <span className="mini-equation">↗ &nbsp; v₀ = 20 m/s</span>
                    <span className="sample-arrow">
                      <Icon name="arrow" />
                    </span>
                  </span>
                </button>
                <button
                  disabled={busy}
                  className="sample sample-linear"
                  onClick={() => load(samples[1])}
                >
                  <span className="sample-top">
                    <span className="subject-label">MATHEMATICS</span>
                    <span className="sample-number">02</span>
                  </span>
                  <strong>A line with a pattern</strong>
                  <span className="sample-description">
                    For y = 2x + 1, what happens when the slope changes?
                  </span>
                  <span className="sample-bottom">
                    <span className="mini-equation">y = 2x + 1</span>
                    <span className="sample-arrow">
                      <Icon name="arrow" />
                    </span>
                  </span>
                </button>
              </div>
              <Link className="text-link library-link" href="/samples">
                Visit the exercise library <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </section>
      )}
      <div ref={output} aria-busy={busy} className="workbench-output">
        {busy && (draft || model) && (
          <p role="status" className="pending-notice">
            Your current model is paused while we read the new problem.
          </p>
        )}
        <fieldset disabled={busy}>
          {draft && !model && (
            <ModelReview
              key={revision}
              problem={draft}
              onConfirm={(problem) => {
                setModel(problem);
                setDraft(null);
              }}
            />
          )}
          {model && (
            <div
              className={
                dedicated
                  ? 'panel simulation-panel dedicated-simulation-panel'
                  : 'panel simulation-panel'
              }
              key={viewRevision}
            >
              <div className="toolbar">
                <span className="eyebrow">
                  <span className="art-live-dot" />
                  {dedicated ? 'YOUR INTERACTIVE MODEL' : 'EXPLORATION'}
                </span>
                <div className="toolbar-actions">
                  <Button variant="outline" onClick={() => load(model)}>
                    <Icon name="sliders" />
                    Edit model & assumptions
                  </Button>
                  <Button
                    variant={predicting ? 'outline' : 'default'}
                    onClick={() => {
                      setPredicting((v) => !v);
                      setRevealed(false);
                      if (dedicated) setDedicatedSection('explore');
                      setRevision((n) => n + 1);
                    }}
                  >
                    <Icon name="target" />
                    {predicting ? 'Return to exploration' : 'Make a prediction'}
                  </Button>
                </div>
              </div>
              {dedicated && question && (
                <section
                  className="submitted-question"
                  aria-labelledby="submitted-question-heading"
                >
                  <span className="section-index">YOUR QUESTION</span>
                  <h2 id="submitted-question-heading">What you asked</h2>
                  <p>{question}</p>
                </section>
              )}
              {dedicated && (
                <div className="problem-section-tabs" role="tablist" aria-label="Problem sections">
                  <button
                    id="problem-tab-explanation"
                    className="problem-section-tab"
                    type="button"
                    role="tab"
                    aria-selected={dedicatedSection === 'explanation'}
                    aria-controls="problem-panel-explanation"
                    tabIndex={dedicatedSection === 'explanation' ? 0 : -1}
                    onClick={() => setDedicatedSection('explanation')}
                    onKeyDown={handleSectionTabKeyDown}
                  >
                    <span className="problem-tab-number">01</span>
                    <span className="problem-tab-copy">
                      <strong>Explanation</strong>
                      <small>Understand the steps</small>
                    </span>
                  </button>
                  <button
                    id="problem-tab-explore"
                    className="problem-section-tab"
                    type="button"
                    role="tab"
                    aria-selected={dedicatedSection === 'explore'}
                    aria-controls="problem-panel-explore"
                    tabIndex={dedicatedSection === 'explore' ? 0 : -1}
                    onClick={() => setDedicatedSection('explore')}
                    onKeyDown={handleSectionTabKeyDown}
                  >
                    <span className="problem-tab-number">02</span>
                    <span className="problem-tab-copy">
                      <strong>
                        {model.type === 'projectile_motion'
                          ? 'Projectile motion'
                          : 'Graph & controls'}
                      </strong>
                      <small>See and adjust the model</small>
                    </span>
                  </button>
                  <button
                    id="problem-tab-guided"
                    className="problem-section-tab"
                    type="button"
                    role="tab"
                    aria-selected={dedicatedSection === 'guided'}
                    aria-controls="problem-panel-guided"
                    tabIndex={dedicatedSection === 'guided' ? 0 : -1}
                    onClick={() => selectSection('guided')}
                    onKeyDown={handleSectionTabKeyDown}
                  >
                    <span className="problem-tab-number">03</span>
                    <span className="problem-tab-copy">
                      <strong>Guided exploration</strong>
                      <small>Work through the steps</small>
                    </span>
                  </button>
                  <button
                    id="problem-tab-chat"
                    className="problem-section-tab"
                    type="button"
                    role="tab"
                    aria-selected={dedicatedSection === 'chat'}
                    aria-controls="problem-panel-chat"
                    tabIndex={dedicatedSection === 'chat' ? 0 : -1}
                    onClick={() => setDedicatedSection('chat')}
                    onKeyDown={handleSectionTabKeyDown}
                  >
                    <span className="problem-tab-number">04</span>
                    <span className="problem-tab-copy">
                      <strong>Ask the tutor</strong>
                      <small>Get an answer to a question</small>
                    </span>
                  </button>
                </div>
              )}
              {dedicated && (
                <section
                  id="problem-panel-explanation"
                  className="explanation-section problem-tab-panel"
                  role="tabpanel"
                  aria-labelledby="problem-tab-explanation"
                  tabIndex={0}
                  hidden={dedicatedSection !== 'explanation'}
                >
                  <div className="explanation-heading">
                    <span className="section-index">01 / EXPLANATION</span>
                    <h2 id="explanation-heading">What is happening?</h2>
                  </div>
                  {model.type === 'projectile_motion' ? (
                    <>
                      <p>
                        The object moves forward while gravity pulls it downward. Its starting speed
                        and launch angle set how long it stays in the air and how far it travels.
                      </p>
                      {projectileComponents && (
                        <p className="explanation-equation">
                          At this angle, the launch gives it{' '}
                          {projectileComponents.horizontal.toFixed(2)} m/s of forward speed and{' '}
                          {projectileComponents.vertical.toFixed(2)} m/s upward. Its path follows{' '}
                          <span className="inline-equation">
                            x(t) = {projectileComponents.horizontal.toFixed(2)}t
                          </span>{' '}
                          and{' '}
                          <span className="inline-equation">
                            y(t) = {projectileComponents.vertical.toFixed(2)}t − ½({model.gravity}
                            )t²
                          </span>
                          .
                        </p>
                      )}
                      <div className="explanation-facts">
                        <span>
                          <strong>{model.velocity} m/s</strong> starting speed
                        </span>
                        <span>
                          <strong>{model.angle}°</strong> launch angle
                        </span>
                        <span>
                          <strong>{model.gravity} m/s²</strong> gravity
                        </span>
                      </div>
                      {projectileComponents && projectileResults && (
                        <div className="explanation-steps">
                          <article>
                            <span className="step-index">01</span>
                            <h3>Separate the launch</h3>
                            <p>
                              The launch angle splits the starting speed into two independent parts.
                              Horizontal speed stays constant because this model has no air drag.
                            </p>
                            <strong>
                              vₓ = {model.velocity} cos({model.angle}°) ={' '}
                              {projectileComponents.horizontal.toFixed(2)} m/s
                            </strong>
                            <strong>
                              vᵧ = {model.velocity} sin({model.angle}°) ={' '}
                              {projectileComponents.vertical.toFixed(2)} m/s
                            </strong>
                          </article>
                          <article>
                            <span className="step-index">02</span>
                            <h3>Follow the vertical motion</h3>
                            <p>
                              Gravity reduces the upward speed by {model.gravity} m/s every second.
                              At the peak, vertical speed reaches zero; then the object falls back
                              to its launch height.
                            </p>
                            <strong>
                              Time to peak = vᵧ ÷ g ={' '}
                              {(projectileResults.flightTime / 2).toFixed(2)} s
                            </strong>
                            <strong>
                              Total flight = 2vᵧ ÷ g = {projectileResults.flightTime.toFixed(2)} s
                            </strong>
                          </article>
                          <article>
                            <span className="step-index">03</span>
                            <h3>Find the landing point</h3>
                            <p>
                              Since horizontal speed is constant, distance is horizontal speed times
                              time in the air. The vertical equation gives the highest point.
                            </p>
                            <strong>
                              Range = vₓ × time = {projectileResults.range.toFixed(2)} m
                            </strong>
                            <strong>
                              Peak height = vᵧ² ÷ 2g = {projectileResults.maxHeight.toFixed(2)} m
                            </strong>
                          </article>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p>
                        A linear function follows{' '}
                        <span className="inline-equation">y = mx + b</span>. The slope <em>m</em>{' '}
                        controls how quickly the line rises or falls, while <em>b</em>
                        is the value where it crosses the y-axis.
                      </p>
                      <p className="explanation-equation">
                        For this problem,{' '}
                        <span className="inline-equation">
                          y = {model.slope}x {model.intercept < 0 ? '−' : '+'}{' '}
                          {Math.abs(model.intercept)}
                        </span>
                        . Every increase of 1 in x changes y by {model.slope}, and at x = 0, y ={' '}
                        {model.intercept}.
                      </p>
                      <div className="explanation-facts">
                        <span>
                          <strong>{model.slope}</strong> slope
                        </span>
                        <span>
                          <strong>{model.intercept}</strong> y-intercept
                        </span>
                      </div>
                      {linearAtThree !== null && (
                        <div className="explanation-steps linear-explanation-steps">
                          <article>
                            <span className="step-index">01</span>
                            <h3>Read the slope</h3>
                            <p>
                              The slope is the change in y for every one-unit step to the right. A
                              positive slope rises, a negative slope falls, and zero makes a flat
                              line.
                            </p>
                            <strong>Change in y per +1 x = {model.slope}</strong>
                          </article>
                          <article>
                            <span className="step-index">02</span>
                            <h3>Find the starting value</h3>
                            <p>
                              At x = 0, the slope term disappears, so the graph crosses the y-axis
                              at the intercept.
                            </p>
                            <strong>y(0) = {model.intercept}</strong>
                          </article>
                          <article>
                            <span className="step-index">03</span>
                            <h3>Try a value</h3>
                            <p>
                              Substitute x = 3 into the equation to predict the matching y value.
                              The graph updates whenever you change either variable.
                            </p>
                            <strong>
                              y(3) = {model.slope} × 3 + ({model.intercept}) = {linearAtThree}
                            </strong>
                          </article>
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}
              <div
                id="problem-panel-explore"
                className="problem-tab-panel"
                role={dedicated ? 'tabpanel' : undefined}
                aria-labelledby={dedicated ? 'problem-tab-explore' : undefined}
                tabIndex={dedicated ? 0 : undefined}
                hidden={dedicated && dedicatedSection !== 'explore'}
              >
                {dedicated && (
                  <div className="dedicated-section-label">
                    <span className="section-index">02 / GRAPH &amp; MEASUREMENTS</span>
                    <span>Explore the result, then change a variable.</span>
                  </div>
                )}
                {model.type === 'projectile_motion' ? (
                  <ProjectileSimulator
                    model={model}
                    onChange={change}
                    onAskAboutPoint={dedicated ? askAboutTrajectoryPoint : undefined}
                    hideResults={predicting && !revealed}
                    paused={busy}
                  />
                ) : (
                  <LinearSimulator
                    model={model}
                    onChange={change}
                    hideResults={predicting && !revealed}
                    paused={busy}
                  />
                )}
                {predicting && (
                  <Prediction key={revision} model={model} onReveal={() => setRevealed(true)} />
                )}
                <details className="model-assumptions">
                  <summary>
                    {dedicated && <span className="section-index">MODEL NOTES</span>}
                    Model assumptions
                  </summary>
                  <ul>
                    {model.assumptions.map((assumption, i) => (
                      <li key={i}>{assumption}</li>
                    ))}
                  </ul>
                </details>
              </div>
              {dedicated && (
                <section
                  id="problem-panel-guided"
                  className="problem-tab-panel"
                  role="tabpanel"
                  aria-labelledby="problem-tab-guided"
                  tabIndex={0}
                  hidden={dedicatedSection !== 'guided'}
                >
                  <GuidedExploration
                    model={model}
                    onChange={change}
                    onViewGraph={() => {
                      setPredicting(false);
                      setRevealed(false);
                      setDedicatedSection('explore');
                      requestAnimationFrame(() =>
                        document.getElementById('problem-tab-explore')?.focus(),
                      );
                    }}
                  />
                </section>
              )}
              {dedicated && (
                <section
                  id="problem-panel-chat"
                  className="problem-tab-panel"
                  role="tabpanel"
                  aria-labelledby="problem-tab-chat"
                  tabIndex={0}
                  hidden={dedicatedSection !== 'chat'}
                >
                  <ProblemChat
                    problem={model}
                    originalQuestion={question}
                    provider={provider}
                    prefillQuestion={tutorPrefill}
                  />
                </section>
              )}
            </div>
          )}
        </fieldset>
      </div>
    </>
  );
}
