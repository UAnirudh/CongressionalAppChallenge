'use client';
import { useState } from 'react';
import { problemSchema, type Problem } from '@/lib/models';
import { Button } from './ui/button';

export function ModelReview({
  problem,
  onConfirm,
}: {
  problem: Problem;
  onConfirm: (problem: Problem) => void;
}) {
  const [error, setError] = useState('');
  return (
    <section className="panel" aria-labelledby="review-heading">
      <h2 id="review-heading" tabIndex={-1}>
        Check your model
      </h2>
      <p>
        Compare these values with your problem before opening the simulation. All fields are
        editable.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const values =
            problem.type === 'projectile_motion'
              ? {
                  velocity: Number(data.get('velocity')),
                  angle: Number(data.get('angle')),
                  gravity: Number(data.get('gravity')),
                }
              : { slope: Number(data.get('slope')), intercept: Number(data.get('intercept')) };
          const result = problemSchema.safeParse({
            ...problem,
            ...values,
            assumptions: String(data.get('assumptions'))
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          });
          if (!result.success) {
            setError(result.error.issues.map((i) => i.message).join(' '));
            return;
          }
          onConfirm(result.data);
        }}
      >
        <div className="fields">
          {(problem.type === 'projectile_motion'
            ? [
                {
                  name: 'velocity',
                  label: 'Initial speed (m/s)',
                  min: 0,
                  max: 100,
                  value: problem.velocity,
                },
                {
                  name: 'angle',
                  label: 'Launch angle (degrees)',
                  min: 0,
                  max: 90,
                  value: problem.angle,
                },
                {
                  name: 'gravity',
                  label: 'Gravity (m/s²)',
                  min: 0.1,
                  max: 30,
                  value: problem.gravity,
                },
              ]
            : [
                {
                  name: 'slope',
                  label: 'Slope (unitless)',
                  min: -100,
                  max: 100,
                  value: problem.slope,
                },
                {
                  name: 'intercept',
                  label: 'Intercept (unitless)',
                  min: -1000,
                  max: 1000,
                  value: problem.intercept,
                },
              ]
          ).map((field) => (
            <label key={field.name}>
              {field.label}
              <input
                type="number"
                name={field.name}
                required
                step="any"
                min={field.min}
                max={field.max}
                defaultValue={field.value}
              />
            </label>
          ))}
        </div>
        <label>
          Extracted assumptions (one per line)
          <textarea
            name="assumptions"
            maxLength={1800}
            defaultValue={problem.assumptions.join('\n')}
            rows={3}
          />
        </label>
        {problem.type === 'projectile_motion' && (
          <p className="note">
            Fixed simulation assumptions: same launch and landing height, no air resistance,
            constant gravity. Editing the notes does not change these rules.
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <Button type="submit">Confirm and explore</Button>
      </form>
    </section>
  );
}
