'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { samples, type Problem } from '@/lib/models';
import { ModelReview } from './model-review';
import { ProjectileSimulator } from './projectile-simulator';
import { LinearSimulator } from './linear-simulator';
import { Prediction } from './prediction';
import { Button } from './ui/button';
import { ProblemInput } from './problem-input';
import { Icon } from './icon';
import type { ProviderInfo } from '@/lib/provider';

export function ProblemWorkbench({
  initialProblem = null,
  provider,
}: {
  initialProblem?: Problem | null;
  provider: ProviderInfo;
}) {
  const [draft, setDraft] = useState<Problem | null>(initialProblem);
  const [model, setModel] = useState<Problem | null>(null);
  const [revision, setRevision] = useState(0);
  const [predicting, setPredicting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewRevision, setViewRevision] = useState(0);
  const output = useRef<HTMLDivElement>(null);
  const phase = model ? 'simulation' : draft ? 'review' : 'input';
  const phaseIndex = phase === 'simulation' ? 2 : phase === 'review' ? 1 : 0;
  // Move focus only when changing views, never while adjusting a variable.
  useEffect(() => {
    output.current?.querySelector('h2')?.focus();
  }, [phase, viewRevision]);
  function load(problem: Problem) {
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
  return (
    <>
      <ol className="journey" aria-label="Your learning journey">
        {['Start with a question', 'Review your model', 'Explore & discover'].map((step, i) => (
          <li
            key={step}
            className={i === phaseIndex ? 'current' : i < phaseIndex ? 'complete' : ''}
            aria-current={i === phaseIndex ? 'step' : undefined}
          >
            <span className="step-number">
              {i < phaseIndex ? <Icon name="check" /> : `0${i + 1}`}
            </span>
            <span>{step}</span>
            {i < 2 && <span className="step-connector" />}
          </li>
        ))}
      </ol>
      <section className="start-section" aria-labelledby="start-heading">
        <div className="section-heading">
          <div>
            <h2 id="start-heading" tabIndex={-1}>
              Where will your curiosity take you?
            </h2>
            <p>Bring your own question, or borrow one of ours.</p>
          </div>
          <span className="section-index">01 / GET STARTED</span>
        </div>
        <div className="start-grid">
          <div className="input-panel">
            <div className="panel-heading">
              <span className="square-icon">
                <Icon name="spark" />
              </span>
              <div>
                <h3>Start with your problem</h3>
                <p>A question is all you need.</p>
              </div>
              <span className="small-label">AI ASSISTED</span>
            </div>
            <ProblemInput onModel={load} onPending={setBusy} provider={provider} />
          </div>
          <div className="sample-panel">
            <div className="sample-panel-heading">
              <h3>Or, jump right in</h3>
              <span className="small-label">NO SETUP NEEDED</span>
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
            <div className="panel simulation-panel">
              <div className="toolbar">
                <span className="eyebrow">
                  <span className="art-live-dot" />
                  YOUR INTERACTIVE MODEL
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
                      setRevision((n) => n + 1);
                    }}
                  >
                    <Icon name="target" />
                    {predicting ? 'Return to exploration' : 'Make a prediction'}
                  </Button>
                </div>
              </div>
              {model.type === 'projectile_motion' ? (
                <ProjectileSimulator
                  model={model}
                  onChange={change}
                  hideResults={predicting && !revealed}
                />
              ) : (
                <LinearSimulator
                  model={model}
                  onChange={change}
                  hideResults={predicting && !revealed}
                />
              )}
              {predicting && (
                <Prediction key={revision} model={model} onReveal={() => setRevealed(true)} />
              )}
              <details className="model-assumptions">
                <summary>Model assumptions</summary>
                <ul>
                  {model.assumptions.map((assumption, i) => (
                    <li key={i}>{assumption}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </fieldset>
      </div>
      {!draft && !model && (
        <div className="learning-note">
          <span className="square-icon">
            <Icon name="sliders" />
          </span>
          <p>
            <strong>The answer is just the beginning.</strong> Change a variable. Make a prediction.
            Find out why.
          </p>
          <Link href="/guide" aria-label="Learn how ConceptLens works">
            <Icon name="arrow" />
          </Link>
        </div>
      )}
    </>
  );
}
