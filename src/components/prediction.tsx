'use client';
import { useState } from 'react';
import { checkPrediction, prediction } from '@/lib/math';
import type { Problem } from '@/lib/models';
import { Button } from './ui/button';
export function Prediction({ model, onReveal }: { model: Problem; onReveal: () => void }) {
  const [feedback, setFeedback] = useState('');
  const challenge = prediction(model);
  return (
    <section className="prediction" aria-labelledby="prediction-heading">
      <h3 id="prediction-heading">Think before you reveal</h3>
      <p>{challenge.question}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const raw = new FormData(e.currentTarget).get('answer');
          if (typeof raw !== 'string' || !raw.trim()) return;
          const answer = Number(raw);
          if (!Number.isFinite(answer)) return;
          setFeedback(
            `${checkPrediction(answer, challenge.answer) ? 'Correct.' : 'Try comparing your reasoning with the graph.'} The answer is ${challenge.answer.toFixed(2)} ${challenge.unit}.`,
          );
          onReveal();
        }}
      >
        <label>
          Your prediction ({challenge.unit})
          <input name="answer" type="number" step="any" required />
        </label>
        <Button type="submit">Check prediction</Button>
      </form>
      <p className="note">Answers within 1% or 0.01 of the calculated value are accepted.</p>
      <p role="status">{feedback}</p>
    </section>
  );
}
