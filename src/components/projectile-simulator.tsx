'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  onAskAboutPoint,
  hideResults,
  paused = false,
}: {
  model: Projectile;
  onChange: (model: Projectile) => void;
  onAskAboutPoint?: (point: ReturnType<typeof projectileState>) => void;
  hideResults: boolean;
  paused?: boolean;
}) {
  const [view, setView] = useState<View>('trajectory');
  const [progress, setProgress] = useState(0.5);
  const progressRef = useRef(0.5);
  const [playing, setPlaying] = useState(false);
  const [baseline, setBaseline] = useState<Projectile | null>(null);
  const [gravityPresetRevision, setGravityPresetRevision] = useState(0);
  const [targetX, setTargetX] = useState('');
  const [targetY, setTargetY] = useState('');
  const [checkpoint, setCheckpoint] = useState<{ x: number; y: number; time: number } | null>(null);
  const [playbackMessage, setPlaybackMessage] = useState('');
  const launchKey = `${model.velocity}:${model.angle}:${model.gravity}`;
  const [previousLaunch, setPreviousLaunch] = useState(launchKey);
  if (previousLaunch !== launchKey) {
    setPreviousLaunch(launchKey);
    setPlaying(false);
    setCheckpoint(null);
    setTargetX('');
    setTargetY('');
    setPlaybackMessage('');
  }
  const result = projectile(model),
    data = projectileTable(model);
  const current = projectileState(model, progress * result.flightTime);
  const comparison = baseline ? projectileTable(baseline) : null;
  const finished = progress >= 1;
  const updateProgress = useCallback((value: number) => {
    const bounded = Math.max(0, Math.min(1, value));
    progressRef.current = bounded;
    setProgress(bounded);
  }, []);
  useEffect(() => {
    if (!playing || hideResults || paused || result.flightTime === 0 || finished) return;
    const timer = setInterval(() => {
      const previous = progressRef.current;
      const next = Math.min(1, previous + 0.01);
      const checkpointProgress = checkpoint ? checkpoint.time / result.flightTime : null;
      const shouldPauseAtCheckpoint =
        checkpointProgress !== null &&
        checkpointProgress >= previous - 0.0001 &&
        checkpointProgress <= next + 0.0001;
      const nextProgress = shouldPauseAtCheckpoint ? checkpointProgress : next;
      updateProgress(nextProgress);
      if (shouldPauseAtCheckpoint && checkpoint) {
        setPlaying(false);
        setPlaybackMessage(
          `Paused at (${checkpoint.x.toFixed(2)} m, ${checkpoint.y.toFixed(2)} m).`,
        );
      } else if (nextProgress >= 1) {
        setPlaying(false);
        setPlaybackMessage('The projectile has completed its flight.');
      }
    }, 50);
    return () => clearInterval(timer);
  }, [playing, hideResults, paused, result.flightTime, finished, checkpoint, updateProgress]);
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
      auxiliary: true,
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
  function setCoordinateCheckpoint() {
    const x = Number(targetX);
    const y = Number(targetY);
    if (!targetX.trim() || !targetY.trim() || !Number.isFinite(x) || !Number.isFinite(y)) {
      setPlaybackMessage('Enter both an x and y coordinate.');
      return;
    }
    if (result.flightTime <= 0) {
      setPlaybackMessage('This launch does not have a flight path to play.');
      return;
    }

    const tolerance = Math.max(0.15, result.maxHeight * 0.02);
    if (x < 0 || x > result.range || y < 0 || y > result.maxHeight + tolerance) {
      setPlaybackMessage(
        `Choose a point within this flight: x from 0 to ${result.range.toFixed(2)} m and y from 0 to ${result.maxHeight.toFixed(2)} m.`,
      );
      return;
    }

    const vx = model.velocity * Math.cos((model.angle * Math.PI) / 180);
    const vy = model.velocity * Math.sin((model.angle * Math.PI) / 180);
    let time: number;
    if (Math.abs(vx) < 0.000001) {
      if (x > tolerance) {
        setPlaybackMessage('This launch travels straight up. Set x to 0 m.');
        return;
      }
      const discriminant = vy * vy - 2 * model.gravity * y;
      if (discriminant < -0.0001) {
        setPlaybackMessage('That height is above the top of this flight.');
        return;
      }
      time = (vy - Math.sqrt(Math.max(0, discriminant))) / model.gravity;
    } else {
      time = x / vx;
      const actualY = Math.max(0, vy * time - (model.gravity * time * time) / 2);
      if (time < 0 || time > result.flightTime || Math.abs(actualY - y) > tolerance) {
        setPlaybackMessage(
          `At x = ${x.toFixed(2)} m, this path is at y = ${actualY.toFixed(2)} m. Enter a point on the curve (within ${tolerance.toFixed(2)} m).`,
        );
        return;
      }
    }

    const point = projectileState(model, Math.max(0, Math.min(result.flightTime, time)));
    setCheckpoint({ x: point.x, y: point.y, time: point.t });
    setPlaying(false);
    updateProgress(0);
    setPlaybackMessage(
      `Pause point set at (${point.x.toFixed(2)} m, ${point.y.toFixed(2)} m). Press play to run from the launch.`,
    );
  }
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
                onInspect={
                  paused
                    ? undefined
                    : (i) => {
                        setPlaying(false);
                        updateProgress(i / 80);
                      }
                }
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
                    if (progress >= 1) updateProgress(0);
                    setPlaybackMessage('');
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
                      updateProgress(Number(e.target.value));
                    }}
                  />
                </label>
                <button
                  className="text-action"
                  onClick={() => {
                    setPlaying(false);
                    updateProgress(0.5);
                    setPlaybackMessage('');
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
              {onAskAboutPoint && (
                <Button variant="outline" onClick={() => onAskAboutPoint(current)}>
                  Ask the tutor about this moment
                </Button>
              )}
              <section className="checkpoint-controls" aria-labelledby="checkpoint-heading">
                <div>
                  <h4 id="checkpoint-heading">Pause at a coordinate</h4>
                  <p>Set an x and y point on the path; playback will stop there.</p>
                </div>
                <div className="checkpoint-fields">
                  <label>
                    x (m)
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={targetX}
                      onChange={(event) => setTargetX(event.target.value)}
                    />
                  </label>
                  <label>
                    y (m)
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={targetY}
                      onChange={(event) => setTargetY(event.target.value)}
                    />
                  </label>
                  <Button variant="outline" onClick={setCoordinateCheckpoint}>
                    Set pause point
                  </Button>
                </div>
                <p className="playback-message" role="status">
                  {playbackMessage ||
                    (checkpoint
                      ? `Marked at x = ${fmt(checkpoint.x)} m, y = ${fmt(checkpoint.y)} m.`
                      : '')}
                </p>
              </section>
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
            key={gravityPresetRevision}
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
                onClick={() => {
                  setGravityPresetRevision((n) => n + 1);
                  onChange({ ...model, gravity: Number(gravity) });
                }}
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
