'use client';
import { useEffect, useRef, useState } from 'react';
import { samples, type Problem } from '@/lib/models';
import { ModelReview } from './model-review';
import { ProjectileSimulator } from './projectile-simulator';
import { LinearSimulator } from './linear-simulator';
import { Prediction } from './prediction';
import { Button } from './ui/button';
import { ProblemInput } from './problem-input';

export function ProblemWorkbench() {
  const [draft, setDraft] = useState<Problem | null>(null);
  const [model, setModel] = useState<Problem | null>(null);
  const [revision, setRevision] = useState(0);
  const [predicting, setPredicting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewRevision, setViewRevision] = useState(0);
  const output = useRef<HTMLDivElement>(null);
  const phase = model ? 'simulation' : draft ? 'review' : 'input';
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
      <section className="panel" aria-labelledby="start-heading">
        <h2 id="start-heading">Start with a question</h2>
        <p>Interpret a problem, or choose an exercise. Review the values before exploring.</p>
        <ProblemInput onModel={load} onPending={setBusy} />
        <h3 className="mt-8">Or try a sample exercise</h3>
        <div className="sample-grid">
          <button disabled={busy} className="sample" onClick={() => load(samples[0])}>
            <strong>A ball in flight</strong>
            <span>Launch at 20 m/s and 45°. How far does it travel?</span>
            <span className="sample-link">Explore projectile motion</span>
          </button>
          <button disabled={busy} className="sample" onClick={() => load(samples[1])}>
            <strong>A line with a pattern</strong>
            <span>For y = 2x + 1, what happens when the slope changes?</span>
            <span className="sample-link">Explore a linear function</span>
          </button>
        </div>
      </section>
      <div ref={output} aria-busy={busy}>
        {busy && (draft || model) && (
          <p role="status">Your current model is paused while we read the new problem.</p>
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
            <div className="panel">
              <div className="toolbar">
                <Button variant="outline" onClick={() => load(model)}>
                  Edit model & assumptions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPredicting((v) => !v);
                    setRevealed(false);
                    setRevision((n) => n + 1);
                  }}
                >
                  {predicting ? 'Return to exploration' : 'Make a prediction'}
                </Button>
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
              <details className="mt-6">
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
