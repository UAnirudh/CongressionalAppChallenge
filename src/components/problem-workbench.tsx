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
  const [inputOpen, setInputOpen] = useState(!initialProblem);
  const [viewRevision, setViewRevision] = useState(0);
  const output = useRef<HTMLDivElement>(null);
  const phase = model ? 'simulation' : draft ? 'review' : 'input';
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
  return (
    <>
      {(draft || model) && (
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
              <span className="small-label">TEXT TO MODEL</span>
            </div>
            <ProblemInput onModel={load} onPending={setBusy} provider={provider} />
          </div>
          <div className="sample-panel">
            <div className="sample-panel-heading">
              <h3>Try an experiment</h3>
              <span className="small-label">NO AI NEEDED</span>
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
            <div className="panel simulation-panel" key={viewRevision}>
              <div className="toolbar">
                <span className="eyebrow">
                  <span className="art-live-dot" />
                  EXPLORATION
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
    </>
  );
}
