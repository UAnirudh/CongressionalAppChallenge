'use client';
import { useState } from 'react';
import { linearIntercept, linearValue } from '@/lib/math';
import type { Linear } from '@/lib/models';
import { ExplorerGraph, type GraphSeries } from './explorer-graph';
import {
  DataTable,
  NumberControl,
  ViewTabs,
  downloadCsv,
  formatNumber as fmt,
} from './explorer-ui';
import { Button } from './ui/button';

export function LinearSimulator({
  model,
  onChange,
  hideResults,
  paused = false,
}: {
  model: Linear;
  onChange: (model: Linear) => void;
  hideResults: boolean;
  paused?: boolean;
}) {
  const [view, setView] = useState<'graph' | 'table'>('graph');
  const [extent, setExtent] = useState(10);
  const [inspect, setInspect] = useState(3);
  const [baseline, setBaseline] = useState<Linear | null>(null);
  const [graphRevision, setGraphRevision] = useState(0);
  const data = Array.from({ length: 101 }, (_, i) => {
    const x = -extent + (i * extent) / 50;
    return { x, y: linearValue(model, x) };
  });
  const selected = { x: inspect, y: linearValue(model, inspect) };
  const intercept = linearIntercept(model);
  const series: GraphSeries[] = [{ name: 'Current function', points: data }];
  if (baseline)
    series.push({
      name: 'Saved function',
      secondary: true,
      points: data.map((p) => ({ x: p.x, y: linearValue(baseline, p.x) })),
    });
  const equation = `y = ${model.slope}x ${model.intercept < 0 ? '−' : '+'} ${Math.abs(model.intercept)}`;
  return (
    <section aria-labelledby="simulation-heading">
      <div className="simulation-title">
        <div>
          <span className="eyebrow">Mathematics / experiment 02</span>
          <h2 id="simulation-heading" tabIndex={-1}>
            Linear function
          </h2>
          <p>Inspect coordinates and see exactly what the slope changes.</p>
        </div>
        <span className="equation-chip">{equation}</span>
      </div>
      <div className="simulation-grid">
        <div className="visualization">
          <div className="explorer-topline">
            <ViewTabs
              id="linear"
              value={view}
              options={[
                { value: 'graph', label: 'Graph' },
                { value: 'table', label: 'Data' },
              ]}
              onChange={setView}
            />
            {!hideResults && (
              <button
                className="text-action"
                onClick={() =>
                  downloadCsv(
                    'conceptlens-linear.csv',
                    ['x_unitless', 'y_unitless'],
                    data.map((p) => [p.x, p.y]),
                  )
                }
              >
                Export CSV ↗
              </button>
            )}
          </div>
          <div id="linear-panel" role="tabpanel" aria-labelledby={`linear-${view}`} tabIndex={0}>
            {hideResults ? (
              <div className="hidden-plot">
                <p>Make your prediction to reveal the graph.</p>
                <span>The inspector and data are hidden too.</span>
              </div>
            ) : view === 'table' ? (
              <DataTable
                caption="Function data · 11 evenly spaced x values"
                headers={['x', 'y = mx + b', 'Change from previous y']}
                rows={Array.from({ length: 11 }, (_, i) => {
                  const x = -extent + (i * extent) / 5;
                  return [
                    fmt(x),
                    fmt(linearValue(model, x)),
                    i ? fmt((model.slope * extent) / 5) : '—',
                  ];
                })}
              />
            ) : (
              <ExplorerGraph
                key={graphRevision}
                series={series}
                xLabel="x (unitless)"
                yLabel="y (unitless)"
                selected={selected}
                onInspect={paused ? undefined : (i) => setInspect(data[i].x)}
                description={`Linear graph with slope ${model.slope} and y intercept ${model.intercept}. At x zero, y is ${model.intercept}.`}
              />
            )}
          </div>
          {!hideResults && (
            <>
              <div className="linear-inspector">
                <NumberControl
                  label="Inspect x"
                  value={inspect}
                  min={-1000}
                  max={1000}
                  onChange={setInspect}
                />
                <span className="inspect-result">
                  f({fmt(inspect)}) = <strong>{fmt(selected.y)}</strong>
                </span>
                <button
                  className="text-action"
                  type="button"
                  onClick={() => {
                    setExtent(Math.max(extent, Math.abs(inspect)));
                    setView('graph');
                    setGraphRevision((n) => n + 1);
                  }}
                >
                  Show on graph
                </button>
              </div>
              {Math.abs(inspect) > extent && (
                <p className="inspection-note">
                  This coordinate is outside the current x window. Choose “Show on graph” to include
                  it.
                </p>
              )}
              <dl className="metrics">
                <div>
                  <dt>Slope · m</dt>
                  <dd>{model.slope}</dd>
                </div>
                <div>
                  <dt>Y-intercept · b</dt>
                  <dd>{model.intercept}</dd>
                </div>
                <div>
                  <dt>X-intercept</dt>
                  <dd className={intercept === undefined ? 'numeric-limit' : undefined}>
                    {intercept === undefined
                      ? 'Outside numeric range'
                      : intercept !== null
                        ? fmt(intercept)
                        : model.intercept === 0
                          ? 'Every x'
                          : 'None'}
                  </dd>
                </div>
              </dl>
              <p className="insight-line">
                {model.slope === 0
                  ? `This is a constant function: every x gives y = ${model.intercept}.`
                  : `For every +1 in x, y ${model.slope > 0 ? 'increases' : 'decreases'} by ${Math.abs(model.slope)}. The line crosses the y axis at (0, ${model.intercept}).`}
              </p>
              {baseline && (
                <p className="comparison-note">
                  Saved: y = {baseline.slope}x + ({baseline.intercept}). At x = {fmt(inspect)}, the
                  current y differs by {fmt(selected.y - linearValue(baseline, inspect))}. The
                  dashed line stays fixed while you edit.
                </p>
              )}
            </>
          )}
        </div>
        <aside className="variable-panel" aria-label="Function controls">
          <h3>The equation</h3>
          <p className="large-equation">y = mx + b</p>
          <NumberControl
            label="Slope"
            value={model.slope}
            min={-100}
            max={100}
            onChange={(slope) => onChange({ ...model, slope })}
          />
          <NumberControl
            label="Intercept"
            value={model.intercept}
            min={-1000}
            max={1000}
            onChange={(intercept) => onChange({ ...model, intercept })}
          />
          <NumberControl
            label="X window (±)"
            value={extent}
            min={1}
            max={1000}
            onChange={setExtent}
          />
          <div className="comparison-control">
            <Button
              variant="outline"
              disabled={hideResults}
              onClick={() => setBaseline({ ...model })}
            >
              {baseline ? 'Replace saved function' : 'Save comparison'}
            </Button>
            {baseline && (
              <button className="text-action" onClick={() => setBaseline(null)}>
                Clear comparison
              </button>
            )}
          </div>
          <details className="explanation" open>
            <summary>Read the slope</summary>
            <p>
              m is the change in y for one unit of x. A negative m falls from left to right; m = 0
              is horizontal. Changing b shifts the entire line up or down without changing its
              slope.
            </p>
          </details>
          <p className="note">
            Both axes are unitless. The y axis fits your values; visual angle depends on the graph
            window.
          </p>
        </aside>
      </div>
    </section>
  );
}
