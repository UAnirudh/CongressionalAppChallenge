'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { checkPrediction } from '@/lib/math';
import type { Exercise } from '@/lib/exercises';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';

type PracticeExercise = Pick<
  Exercise,
  'id' | 'question' | 'hints' | 'solution' | 'answer' | 'answerUnit' | 'answerLabel'
>;

export function ExercisePractice({ exercise }: { exercise: PracticeExercise }) {
  const practiceRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    kind: 'error' | 'success' | 'note';
  } | null>(null);

  function startPractice() {
    setStarted(true);
    window.requestAnimationFrame(() =>
      practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  }

  function revealHint() {
    if (hintCount >= exercise.hints.length) return;
    const nextHint = hintCount + 1;
    setHintCount(nextHint);
    setFeedback({ message: `Hint ${nextHint} is ready below.`, kind: 'note' });
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAnswer = Number(answer);
    if (!answer.trim() || !Number.isFinite(numericAnswer)) {
      setFeedback({ message: 'Enter a number to check your answer.', kind: 'error' });
      return;
    }
    if (checkPrediction(numericAnswer, exercise.answer)) {
      setSolved(true);
      setShowSolution(true);
      setFeedback({ message: 'That’s it. You found the answer.', kind: 'success' });
      return;
    }
    if (hintCount < exercise.hints.length) {
      const nextHint = hintCount + 1;
      setHintCount(nextHint);
      setFeedback({
        message: `Not quite yet. Use hint ${nextHint} to take the next step.`,
        kind: 'note',
      });
      return;
    }
    setShowSolution(true);
    setFeedback({ message: 'Let’s put the steps together and see the solution.', kind: 'note' });
  }

  return (
    <section className="exercise-practice-card" ref={practiceRef} aria-label="Guided practice">
      {!started ? (
        <div className="practice-start-state">
          <div className="practice-start-copy">
            <span className="practice-number">01</span>
            <div>
              <h3>Ready when you are.</h3>
              <p>
                Your first try is yours. Hints and the worked solution stay tucked away until you
                need them.
              </p>
            </div>
          </div>
          <Button type="button" onClick={startPractice}>
            Start practice <Icon name="arrow" />
          </Button>
        </div>
      ) : (
        <div className="practice-active-state">
          <div className="practice-question-card">
            <span className="eyebrow">Problem</span>
            <p>{exercise.question}</p>
          </div>

          <form className="practice-answer-form" onSubmit={submitAnswer}>
            <label htmlFor={`answer-${exercise.id}`}>
              {exercise.answerLabel}
              <span>Enter a number</span>
            </label>
            <div className="practice-answer-row">
              <div className="practice-answer-input">
                <input
                  id={`answer-${exercise.id}`}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setFeedback(null);
                  }}
                  aria-describedby={`unit-${exercise.id}`}
                />
                <span id={`unit-${exercise.id}`}>{exercise.answerUnit}</span>
              </div>
              <Button type="submit" variant="outline">
                Check answer <Icon name="check" />
              </Button>
            </div>
          </form>

          {feedback && (
            <p className={`practice-feedback ${feedback.kind}`} role="status" aria-live="polite">
              {feedback.message}
            </p>
          )}

          {hintCount > 0 && (
            <div className="practice-hints">
              {exercise.hints.slice(0, hintCount).map((hint, index) => (
                <div className="practice-hint" key={hint}>
                  <span>HINT {String(index + 1).padStart(2, '0')}</span>
                  <p>{hint}</p>
                </div>
              ))}
            </div>
          )}

          <div className="practice-progress-actions">
            {!solved && hintCount < exercise.hints.length && (
              <button className="text-action" type="button" onClick={revealHint}>
                <Icon name="spark" /> Show me a hint
              </button>
            )}
            {!solved && hintCount === exercise.hints.length && !showSolution && (
              <button className="text-action" type="button" onClick={() => setShowSolution(true)}>
                Reveal worked solution
              </button>
            )}
          </div>

          {showSolution && (
            <div className="practice-solution">
              <span className="eyebrow">{solved ? 'You got it' : 'Worked solution'}</span>
              <h3>Put the pieces together.</h3>
              <ol>
                {exercise.solution.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="practice-final-answer">
                <span>ANSWER</span>
                <strong>
                  {Number(exercise.answer.toFixed(2))} <small>{exercise.answerUnit}</small>
                </strong>
              </div>
            </div>
          )}

          <div className="practice-bottom-link">
            <Link href="/samples">
              <Icon name="back" /> Back to the exercise library
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
