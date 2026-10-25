'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { checkPrediction, linearValue, projectile, projectileState } from '@/lib/math';
import {
  createExploration,
  describeModel,
  modelSignature,
  showValue,
} from '@/lib/guided-exploration';
import type { Problem } from '@/lib/models';
import { ExplorerGraph, type GraphSeries } from './explorer-graph';
import { Button } from './ui/button';
import { Icon } from './icon';
import styles from './guided-exploration.module.css';

type Props = {
  model: Problem;
  onChange: (model: Problem) => void;
  onViewGraph: () => void;
};

type Attempt = {
  answer: string;
  hints: number;
  outcome: 'correct' | 'worked' | null;
  feedback: string;
  invalid: boolean;
};

function graphPoints(model: Problem) {
  return model.type === 'projectile_motion'
    ? projectile(model).points
    : Array.from({ length: 61 }, (_, i) => {
        const x = -5 + i / 6;
        return { x, y: linearValue(model, x) };
      });
}

export function GuidedExploration(props: Props) {
  const [run, setRun] = useState<{ model: Problem; revision: number } | null>(null);
  function start() {
    setRun((previous) => ({ model: props.model, revision: (previous?.revision ?? 0) + 1 }));
  }

  if (run) {
    return (
      <ExplorationSession key={run.revision} {...props} baseline={run.model} onRestart={start} />
    );
  }

  return (
    <section className={styles.welcome} aria-labelledby="guided-heading">
      <div>
        <span className="eyebrow">03 / Guided exploration</span>
        <h2 id="guided-heading">Understand the model, one step at a time.</h2>
        <p>
          Work through four short steps using your problem’s values. Try each calculation, get a
          hint when you need one, then predict a change and see it on the graph.
        </p>
        <ol className={styles.previewSteps}>
          {(props.model.type === 'linear_function'
            ? [
                'Find the intercept',
                'Understand the slope',
                'Calculate a point',
                'Change and compare',
              ]
            : [
                'Split the velocity',
                'Find the flight time',
                'Calculate the range',
                'Change and compare',
              ]
          ).map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ol>
        <Button type="button" onClick={start}>
          Start guided exploration <Icon name="arrow" />
        </Button>
        <p className={styles.smallNote}>Uses your current model. No extra AI wait.</p>
      </div>
      <div className={styles.modelNote}>
        <Icon name="target" />
        <span>Your starting model</span>
        <strong>{describeModel(props.model)}</strong>
        <p>
          {props.model.type === 'linear_function'
            ? 'See how the slope and intercept connect the equation to every point on the line.'
            : 'Connect the launch velocity, time in the air, and horizontal distance.'}
        </p>
      </div>
    </section>
  );
}

function ExplorationSession({
  model,
  baseline,
  onChange,
  onRestart,
  onViewGraph,
}: Props & { baseline: Problem; onRestart: () => void }) {
  const lesson = createExploration(baseline);
  const [activeStep, setActiveStep] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>(() =>
    lesson.steps.map(() => ({
      answer: '',
      hints: 0,
      outcome: null,
      feedback: '',
      invalid: false,
    })),
  );
  const [applied, setApplied] = useState(false);
  const [complete, setComplete] = useState(false);
  const answerId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [activeStep, complete]);

  const expectedModel = applied ? lesson.changedModel : baseline;
  const modelChanged = modelSignature(model) !== modelSignature(expectedModel);
  const step = lesson.steps[activeStep];
  const attempt = attempts[activeStep];
  const isLast = activeStep === lesson.steps.length - 1;
  const finishedCount = attempts.filter((item) => item.outcome !== null).length;

  function updateAttempt(update: Partial<Attempt>) {
    setAttempts((previous) =>
      previous.map((item, index) => (index === activeStep ? { ...item, ...update } : item)),
    );
  }

  function checkAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(attempt.answer);
    if (!attempt.answer.trim() || !Number.isFinite(value)) {
      updateAttempt({ feedback: 'Enter a finite number to check your answer.', invalid: true });
      return;
    }
    if (checkPrediction(value, step.answer)) {
      updateAttempt({
        outcome: 'correct',
        feedback: 'That’s right. Now connect the calculation to the graph.',
        invalid: false,
      });
    } else {
      updateAttempt({
        hints: Math.min(step.hints.length, attempt.hints + 1),
        feedback: 'Not quite yet. Use the hint below and try the calculation again.',
        invalid: true,
      });
    }
  }

  if (modelChanged) {
    return (
      <section className={styles.notice} aria-labelledby="guided-changed-heading">
        <Icon name="sliders" />
        <div>
          <h2 id="guided-changed-heading">Your model has changed.</h2>
          <p>
            Start a fresh walkthrough so the questions, calculations, and graph use your current
            values.
          </p>
          <Button type="button" onClick={onRestart}>
            Restart with current values <Icon name="arrow" />
          </Button>
        </div>
      </section>
    );
  }

  if (complete) {
    const checked = attempts.filter((item) => item.outcome === 'correct').length;
    return (
      <section className={styles.completion} aria-labelledby="guided-complete-heading">
        <span className={styles.completeIcon}>
          <Icon name="check" />
        </span>
        <span className="eyebrow">Exploration complete</span>
        <h2 id="guided-complete-heading" ref={heading} tabIndex={-1}>
          You connected the steps.
        </h2>
        <p>{lesson.comparison}</p>
        <p className={styles.smallNote}>
          {checked} of 4 answers checked correctly · {4 - checked} worked steps reviewed. The
          changed values are now in your main model.
        </p>
        <div className={styles.completionActions}>
          <Button type="button" onClick={onViewGraph}>
            Explore the updated model <Icon name="arrow" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setComplete(false);
              setActiveStep(0);
            }}
          >
            Review the steps
          </Button>
          <button type="button" className="text-action" onClick={onRestart}>
            Start again with current values
          </button>
        </div>
      </section>
    );
  }

  // Earlier steps always review the original values, even after the experiment is applied.
  const comparing = applied && isLast;
  const graphModel = comparing ? lesson.changedModel : baseline;
  const series: GraphSeries[] = [
    { name: comparing ? 'Changed model' : 'Starting model', points: graphPoints(graphModel) },
  ];
  if (comparing)
    series.push({ name: 'Starting model', points: graphPoints(baseline), secondary: true });
  const linearX = activeStep === 0 ? 0 : activeStep === 1 ? 1 : 3;
  const selected =
    graphModel.type === 'linear_function'
      ? { x: linearX, y: linearValue(graphModel, linearX) }
      : projectileState(
          graphModel,
          activeStep === 0 ? 0 : projectile(graphModel).flightTime * (activeStep === 1 ? 0.5 : 1),
        );
  const caption =
    graphModel.type === 'linear_function'
      ? attempt.outcome
        ? `The marked point is (${showValue(selected.x)}, ${showValue(selected.y)}).`
        : activeStep === 0
          ? 'Look for where the line crosses the vertical axis.'
          : activeStep === 1
            ? 'Compare the line at x = 0 and x = 1. The slope tells you the change in height.'
            : 'Use the equation to find the height of the marked point at x = 3.'
      : activeStep === 0
        ? 'The marked point is the launch position.'
        : activeStep === 1
          ? 'The marked point is halfway through the flight, at the highest point.'
          : 'The marked point is the landing position.';

  return (
    <section className={styles.session} aria-labelledby="guided-step-heading">
      <div className={styles.sessionTop}>
        <span className="eyebrow">03 / Guided exploration</span>
        <button type="button" className="text-action" onClick={onViewGraph}>
          Open full graph &amp; controls <Icon name="arrow" />
        </button>
      </div>
      <ol className={styles.progress} aria-label="Exploration progress">
        {lesson.steps.map((item, index) => (
          <li
            key={item.title}
            aria-current={index === activeStep ? 'step' : undefined}
            data-done={attempts[index].outcome !== null}
          >
            <span aria-hidden="true">
              {attempts[index].outcome !== null ? <Icon name="check" /> : index + 1}
            </span>
            {item.title}
          </li>
        ))}
      </ol>
      <div className={styles.sessionGrid}>
        <div className={styles.stepCard}>
          <span className={styles.stepLabel}>Step {activeStep + 1} of 4</span>
          <h2 id="guided-step-heading" ref={heading} tabIndex={-1}>
            {step.title}
          </h2>
          <p className={styles.idea}>{step.idea}</p>
          <div className={styles.question}>
            <h3>{step.question}</h3>
          </div>
          {!attempt.outcome && (
            <form onSubmit={checkAnswer} noValidate className={styles.answerForm}>
              <label htmlFor={answerId}>Your answer ({step.unit})</label>
              <div className={styles.answerRow}>
                <input
                  key={activeStep}
                  id={answerId}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={attempt.answer}
                  aria-invalid={attempt.invalid}
                  aria-describedby={`${answerId}-feedback ${answerId}-rounding`}
                  onChange={(event) =>
                    updateAttempt({ answer: event.target.value, feedback: '', invalid: false })
                  }
                />
                <Button type="submit">
                  Check answer <Icon name="check" />
                </Button>
              </div>
              <p id={`${answerId}-rounding`} className={styles.smallNote}>
                Round at the end. Answers within 1% or 0.01 are accepted.
              </p>
            </form>
          )}
          <p
            id={`${answerId}-feedback`}
            role="status"
            className={attempt.invalid ? styles.error : styles.feedback}
          >
            {attempt.feedback}
          </p>
          {!attempt.outcome && (
            <>
              {step.hints.slice(0, attempt.hints).map((hint, index) => (
                <p className={styles.hint} key={hint}>
                  <strong>Hint {index + 1}</strong>
                  {hint}
                </p>
              ))}
              <div className={styles.helpActions}>
                {attempt.hints < step.hints.length && (
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => updateAttempt({ hints: attempt.hints + 1 })}
                  >
                    <Icon name="spark" /> Show a hint
                  </button>
                )}
                <button
                  type="button"
                  className="text-action"
                  onClick={() =>
                    updateAttempt({
                      outcome: 'worked',
                      feedback: 'Read the worked step, then continue when it makes sense.',
                      invalid: false,
                    })
                  }
                >
                  Show worked step
                </button>
              </div>
            </>
          )}
          {attempt.outcome && (
            <div className={styles.working}>
              <span className="eyebrow">Work it through</span>
              <ol>
                {step.working.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
              <p>{step.takeaway}</p>
            </div>
          )}
          {isLast && attempt.outcome && (
            <div className={styles.experiment}>
              <strong>{lesson.changeLabel}</strong>
              <p>
                {applied
                  ? lesson.comparison
                  : 'Apply this change to compare the new graph with your starting model. It also updates the main graph and controls.'}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={applied}
                onClick={() => {
                  setApplied(true);
                  onChange(lesson.changedModel);
                }}
              >
                {applied ? 'Change applied' : 'Apply change & compare'}{' '}
                <Icon name={applied ? 'check' : 'sliders'} />
              </Button>
            </div>
          )}
          <div className={styles.navigation}>
            <Button
              type="button"
              variant="outline"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((index) => index - 1)}
            >
              <Icon name="back" /> Back
            </Button>
            <span>{finishedCount} of 4 steps reviewed</span>
            <Button
              type="button"
              disabled={!attempt.outcome || (isLast && !applied)}
              onClick={() => (isLast ? setComplete(true) : setActiveStep((index) => index + 1))}
            >
              {isLast ? 'Finish exploration' : 'Next step'} <Icon name="arrow" />
            </Button>
          </div>
        </div>
        <aside className={styles.graphCard} aria-label="Guided exploration graph">
          <div className={styles.graphHeading}>
            <span className="eyebrow">
              {comparing ? 'Compare the change' : 'Your starting model'}
            </span>
            <strong>{describeModel(graphModel)}</strong>
          </div>
          <ExplorerGraph
            key={comparing ? 'compared' : 'original'}
            series={series}
            xLabel={model.type === 'linear_function' ? 'x (unitless)' : 'Horizontal distance (m)'}
            yLabel={model.type === 'linear_function' ? 'y (unitless)' : 'Height (m)'}
            selected={selected}
            equalScale={model.type === 'projectile_motion'}
            description={`${comparing ? 'Changed model compared with the starting model.' : 'Starting model.'} ${caption}`}
            legendHint="Use zoom to take a closer look"
          />
          <p className={styles.caption}>{caption}</p>
          {comparing && (
            <p className={styles.caption}>
              The dashed line keeps your starting model for comparison.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
