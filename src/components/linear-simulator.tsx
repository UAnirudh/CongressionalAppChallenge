'use client';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { linearValue } from '@/lib/math';
import type { Linear } from '@/lib/models';
import { useState } from 'react';

export function LinearSimulator({
  model,
  onChange,
  hideResults,
}: {
  model: Linear;
  onChange: (model: Linear) => void;
  hideResults: boolean;
}) {
  const [slope, setSlope] = useState(String(model.slope));
  const [intercept, setIntercept] = useState(String(model.intercept));
  const validSlope =
    slope.trim() !== '' && Number.isFinite(Number(slope)) && Math.abs(Number(slope)) <= 100;
  const validIntercept =
    intercept.trim() !== '' &&
    Number.isFinite(Number(intercept)) &&
    Math.abs(Number(intercept)) <= 1000;
  const data = Array.from({ length: 21 }, (_, i) => ({ x: i - 10, y: linearValue(model, i - 10) }));
  return (
    <section aria-labelledby="simulation-heading">
      <h2 id="simulation-heading" tabIndex={-1}>
        Linear function
      </h2>
      <p>
        y = {model.slope}x {model.intercept < 0 ? '−' : '+'} {Math.abs(model.intercept)}
      </p>
      <div
        className="plot"
        role="img"
        aria-label={
          hideResults
            ? 'Graph hidden during prediction'
            : `Linear graph with slope ${model.slope} and y intercept ${model.intercept}. At x zero, y is ${model.intercept}.`
        }
      >
        {hideResults ? (
          <p className="p-12">Make your prediction to reveal the graph.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 20, right: 32, bottom: 20, left: 16 }}>
              <CartesianGrid stroke="#dce7f4" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[-10, 10]}
                label={{ value: 'x (unitless)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis width={70} />
              <Tooltip />
              <Line
                type="linear"
                dataKey="y"
                stroke="#1d61cd"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="fields">
        <label>
          Slope
          <input
            type="number"
            min="-100"
            max="100"
            step="any"
            value={slope}
            aria-invalid={!validSlope}
            aria-describedby="linear-input-note"
            onChange={(e) => {
              setSlope(e.target.value);
              if (e.target.value !== '' && e.target.validity.valid)
                onChange({ ...model, slope: Number(e.target.value) });
            }}
          />
        </label>
        <label>
          Intercept
          <input
            type="number"
            min="-1000"
            max="1000"
            step="any"
            value={intercept}
            aria-invalid={!validIntercept}
            aria-describedby="linear-input-note"
            onChange={(e) => {
              setIntercept(e.target.value);
              if (e.target.value !== '' && e.target.validity.valid)
                onChange({ ...model, intercept: Number(e.target.value) });
            }}
          />
        </label>
      </div>
      <p id="linear-input-note" className="note" role="status">
        {!validSlope || !validIntercept
          ? 'Enter a slope from −100 to 100 and an intercept from −1000 to 1000. The graph keeps the last valid values.'
          : 'Change either value to update the graph.'}
      </p>
      <p className="note">
        Graph window: −10 ≤ x ≤ 10. Both axes are unitless. The y axis rescales automatically.
      </p>
    </section>
  );
}
