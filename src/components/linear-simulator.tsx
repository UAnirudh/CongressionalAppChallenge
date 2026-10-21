'use client';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { linearValue } from '@/lib/math';
import type { Linear } from '@/lib/models';
import { useState } from 'react';
import { Icon } from './icon';

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
      <div className="simulation-title">
        <div>
          <h2 id="simulation-heading" tabIndex={-1}>
            Linear function
          </h2>
          <p>A small change. A different perspective.</p>
        </div>
        <span className="subject-tag">MATHEMATICS</span>
      </div>
      <div className="simulation-grid">
        <div className="visualization">
          <div className="plot-heading">
            <span>
              <span className="art-live-dot" />
              Your function
            </span>
            <span>
              y = {model.slope}x {model.intercept < 0 ? '−' : '+'} {Math.abs(model.intercept)}
            </span>
          </div>
          <div
            className="plot linear-plot"
            role="img"
            aria-label={
              hideResults
                ? 'Graph hidden during prediction'
                : `Linear graph with slope ${model.slope} and y intercept ${model.intercept}. At x zero, y is ${model.intercept}.`
            }
          >
            {hideResults ? (
              <div className="hidden-plot">
                <Icon name="target" />
                <p>Make your prediction to reveal the graph.</p>
                <span>A little reasoning before the reveal.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data} margin={{ top: 26, right: 24, bottom: 20, left: 0 }}>
                  <CartesianGrid stroke="var(--plot-grid)" strokeDasharray="3 4" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[-10, 10]}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'x (unitless)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis width={65} tickLine={false} axisLine={false} />
                  <ReferenceLine x={0} stroke="var(--plot-axis)" />
                  <ReferenceLine y={0} stroke="var(--plot-axis)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      fontSize: 13,
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="y"
                    stroke="var(--green)"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="plot-caption">
            Graph window: −10 ≤ x ≤ 10. Both axes are unitless. The y axis rescales automatically.
          </p>
          {!hideResults && (
            <dl className="metrics linear-metrics">
              <div>
                <dt>Slope · m</dt>
                <dd>{model.slope}</dd>
              </div>
              <div>
                <dt>Y-intercept · b</dt>
                <dd>{model.intercept}</dd>
              </div>
              <div>
                <dt>Relationship</dt>
                <dd className="relationship-value">
                  {model.slope > 0 ? 'Increasing' : model.slope < 0 ? 'Decreasing' : 'Constant'}
                </dd>
              </div>
            </dl>
          )}
        </div>
        <div className="variable-panel">
          <span className="eyebrow">
            <Icon name="sliders" />
            THE VARIABLES
          </span>
          <h3>Find the pattern.</h3>
          <p className="note">Change a value. Follow the line.</p>
          <div className="fields linear-fields">
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
          <div className="formula-note">
            <span>THE RELATIONSHIP</span>
            <p>y = mx + b</p>
          </div>
          <p className="note">
            The slope sets the direction. The intercept sets where the line meets the y axis.
          </p>
        </div>
      </div>
    </section>
  );
}
