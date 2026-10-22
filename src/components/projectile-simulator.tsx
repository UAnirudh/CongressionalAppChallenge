'use client';
import { useEffect, useState } from 'react';
import { projectile, projectileState, projectileTable } from '@/lib/math';
import type { Projectile } from '@/lib/models';
import { ExplorerGraph, type GraphSeries } from './explorer-graph';
import {
  DataTable,
  NumberControl,
  ViewTabs,
  downloadCsv,
  formatNumber as fmt,
} from './explorer-ui';
import { Button } from './ui/button';

type View = 'trajectory' | 'height' | 'velocity' | 'table';
const views: { value: View; label: string }[] = [
  { value: 'trajectory', label: 'Flight path' },
  { value: 'height', label: 'Height' },
  { value: 'velocity', label: 'Velocity' },
  { value: 'table', label: 'Data' },
];

export function ProjectileSimulator({
  model,
  onChange,
  hideResults,
}: {
  model: Projectile;
  onChange: (model: Projectile) => void;
  hideResults: boolean;
}) {
  const [view, setView] = useState<View>('trajectory');
  const [progress, setProgress] = useState(0.5);
  const [playing, setPlaying] = useState(false);
  const [baseline, setBaseline] = useState<Projectile | null>(null);
  const result = projectile(model),
    data = projectileTable(model);
  const current = projectileState(model, progress * result.flightTime);
  const comparison = baseline ? projectileTable(baseline) : null;
  const finished = progress >= 1;
  useEffect(() => {
    if (!playing || hideResults || result.flightTime === 0 || finished) return;
    const timer = setInterval(() => setProgress((value) => Math.min(1, value + 0.01)), 50);
    return () => clearInterval(timer);
  }, [playing, hideResults, result.flightTime, finished]);
  const project = (row: typeof current) =>
    view === 'trajectory'
      ? { x: row.x, y: row.y }
      : { x: row.t, y: view === 'height' ? row.y : row.vy };
  const series: GraphSeries[] = [
    {
      name: view === 'velocity' ? 'Vertical velocity' : 'Current launch',
      points: data.map(project),
    },
  ];
  if (view === 'velocity')
    series.push({
      name: 'Horizontal velocity',
      secondary: true,
      points: data.map((row) => ({ x: row.t, y: row.vx })),
    });
  if (comparison)
    series.push({ name: 'Saved launch', secondary: true, points: comparison.map(project) });
  const exportData = () =>
    downloadCsv(
      'conceptlens-projectile.csv',
      ['time_s', 'distance_m', 'height_m', 'vx_m_s', 'vy_m_s', 'speed_m_s'],
      data.map((row) => [row.t, row.x, row.y, row.vx, row.vy, row.speed]),
    );
  return (
    <section aria-labelledby="simulation-heading">
      <div className="simulation-title">
        <div>
          <span className="eyebrow">Physics / experiment 01</span>
          <h2 id="simulation-heading" tabIndex={-1}>
            Projectile motion
          </h2>
          <p>Follow the flight, inspect a moment, compare a change.</p>
        </div>
        <span className="equation-chip">x = vₓt · y = vᵧ₀t − ½gt²</span>
      </div>
      <div className="simulation-grid">
        <div className="visualization">
          <div className="explorer-topline">
            <ViewTabs id="flight" value={view} options={views} onChange={setView} />
            {!hideResults && (
              <button className="text-action" onClick={exportData}>
                Export CSV ↗
              </button>
            )}
          </div>
          <div id="flight-panel" role="tabpanel" aria-labelledby={`flight-${view}`} tabIndex={0}>
            {hideResults ? (
              <div className="hidden-plot">
                <p>Make your prediction to reveal the path.</p>
                <span>The inspector and data are hidden too.</span>
              </div>
            ) : view === 'table' ? (
              <DataTable
                caption="Flight data · 11 evenly spaced moments"
                headers={['t (s)', 'x (m)', 'y (m)', 'vₓ (m/s)', 'vᵧ (m/s)', 'Speed (m/s)']}
                rows={projectileTable(model, 10).map((row) =>
                  [row.t, row.x, row.y, row.vx, row.vy, row.speed].map(fmt),
                )}
              />
            ) : (
              <ExplorerGraph
                key={view}
                series={series}
                xLabel={view === 'trajectory' ? 'Distance (m)' : 'Time (s)'}
                yLabel={view === 'velocity' ? 'Velocity (m/s)' : 'Height (m)'}
                selected={project(current)}
                equalScale={view === 'trajectory'}
                onInspect={(i) => {
                  setPlaying(false);
                  setProgress(i / 80);
                }}
                description={`Trajectory: range ${result.range.toFixed(2)} meters and peak ${result.maxHeight.toFixed(2)} meters. ${view === 'trajectory' ? 'Equal distance scales on both axes.' : view + ' over time.'}`}
              />
            )}
          </div>
          {!hideResults && (
            <>
              <div className="time-inspector">
                <button
                  className="play-control"
                  disabled={result.flightTime === 0}
                  aria-label={playing && progress < 1 ? 'Pause flight' : 'Play flight'}
                  onClick={() => {
                    if (progress >= 1) setProgress(0);
                    setPlaying((v) => !v || progress >= 1);
                  }}
                >
                  {playing && progress < 1 ? 'Ⅱ' : '▶'}
                </button>
                <label>
                  Inspect time <output>{fmt(current.t)} s</output>
                  <input
                    type="range"
                    aria-label="Inspect time"
                    aria-valuetext={`${fmt(current.t)} seconds; distance ${fmt(current.x)} meters; height ${fmt(current.y)} meters; vertical velocity ${fmt(current.vy)} meters per second`}
                    min="0"
                    max="1"
                    step="0.001"
                    value={progress}
                    onChange={(e) => {
                      setPlaying(false);
                      setProgress(Number(e.target.value));
                    }}
                  />
                </label>
                <button
                  className="text-action"
                  onClick={() => {
                    setPlaying(false);
                    setProgress(0.5);
                  }}
                >
                  Peak
                </button>
              </div>
              <dl className="point-readout" aria-label="Inspected flight point">
                <div>
                  <dt>Distance</dt>
                  <dd>{fmt(current.x)} m</dd>
                </div>
                <div>
                  <dt>Height</dt>
                  <dd>{fmt(current.y)} m</dd>
                </div>
                <div>
                  <dt>Horizontal v</dt>
                  <dd>{fmt(current.vx)} m/s</dd>
                </div>
                <div>
                  <dt>Vertical v</dt>
                  <dd>{fmt(current.vy)} m/s</dd>
                </div>
              </dl>
              <dl className="metrics">
                <div>
                  <dt>Flight time</dt>
                  <dd>{result.flightTime.toFixed(2)} s</dd>
                </div>
                <div>
                  <dt>Range</dt>
                  <dd>{result.range.toFixed(2)} m</dd>
                </div>
                <div>
                  <dt>Maximum height</dt>
                  <dd>{result.maxHeight.toFixed(2)} m</dd>
                </div>
              </dl>
              {baseline && (
                <p className="comparison-note">
                  Saved launch: {baseline.velocity} m/s at {baseline.angle}°, g = {baseline.gravity}{' '}
                  m/s². Range change: {fmt(result.range - projectile(baseline).range)} m. The dashed
                  curve stays fixed while you edit.
                </p>
              )}
            </>
          )}
        </div>
        <aside className="variable-panel" aria-label="Launch controls">
          <h3>Launch conditions</h3>
          {[
            { label: 'Initial speed', key: 'velocity', unit: 'm/s', min: 0, max: 100 },
            { label: 'Launch angle', key: 'angle', unit: '°', min: 0, max: 90 },
          ].map((field) => (
            <div className="parameter-control" key={field.key}>
              <NumberControl
                label={`${field.label} (${field.unit})`}
                value={model[field.key as 'velocity' | 'angle']}
                min={field.min}
                max={field.max}
                onChange={(value) => onChange({ ...model, [field.key]: value })}
              />
              <input
                type="range"
                aria-label={field.label}
                min={field.min}
                max={field.max}
                step="any"
                value={model[field.key as 'velocity' | 'angle']}
                onChange={(event) =>
                  onChange({ ...model, [field.key]: Number(event.target.value) })
                }
              />
            </div>
          ))}
          <NumberControl
            label="Gravity (m/s²)"
            value={model.gravity}
            min={0.1}
            max={30}
            onChange={(gravity) => onChange({ ...model, gravity })}
          />
          <div className="gravity-presets" role="group" aria-label="Gravity presets">
            {[
              ['Earth', 9.81],
              ['Moon', 1.62],
              ['Mars', 3.71],
            ].map(([label, gravity]) => (
              <button
                key={label}
                aria-pressed={model.gravity === gravity}
                onClick={() => onChange({ ...model, gravity: Number(gravity) })}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="comparison-control">
            <Button
              variant="outline"
              disabled={hideResults}
              onClick={() => setBaseline({ ...model })}
            >
              {baseline ? 'Replace saved launch' : 'Save comparison'}
            </Button>
            {baseline && (
              <button className="text-action" onClick={() => setBaseline(null)}>
                Clear comparison
              </button>
            )}
          </div>
          <details className="explanation" open>
            <summary>What to look for</summary>
            <p>
              At the peak, vertical velocity is zero. Horizontal velocity stays constant throughout
              the flight. Try complementary angles, such as 30° and 60°: they travel the same
              distance, but reach different heights.
            </p>
          </details>
          <p className="note">
            Same launch and landing height. No air resistance. Flight path uses equal scales on both
            axes.
          </p>
        </aside>
      </div>
    </section>
  );
}
