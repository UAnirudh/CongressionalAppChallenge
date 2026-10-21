'use client';
import { projectile } from '@/lib/math';
import type { Projectile } from '@/lib/models';
import { Icon } from './icon';

export function ProjectileSimulator({
  model,
  onChange,
  hideResults,
}: {
  model: Projectile;
  onChange: (model: Projectile) => void;
  hideResults: boolean;
}) {
  const result = projectile(model);
  // Equal pixels per meter on both axes preserves the physical launch angle.
  const scale = Math.min(510 / Math.max(10, result.range), 220 / Math.max(5, result.maxHeight));
  const width = 510 / scale,
    height = 220 / scale;
  const path = result.points
    .map((point, i) => `${i ? 'L' : 'M'}${60 + point.x * scale},${260 - point.y * scale}`)
    .join(' ');
  const peakX = 60 + (result.range * scale) / 2;
  const peakY = 260 - result.maxHeight * scale;
  return (
    <section aria-labelledby="simulation-heading">
      <div className="simulation-title">
        <div>
          <h2 id="simulation-heading" tabIndex={-1}>
            Projectile motion
          </h2>
          <p>Change the launch. Watch the path respond.</p>
        </div>
        <span className="subject-tag">PHYSICS</span>
      </div>
      <div className="simulation-grid">
        <div className="visualization">
          <div className="plot-heading">
            <span>
              <span className="art-live-dot" />
              Trajectory
            </span>
            <span>POSITION / METERS</span>
          </div>
          <div className="plot projectile-plot">
            {hideResults ? (
              <div className="hidden-plot">
                <Icon name="target" />
                <p>Make your prediction to reveal the path.</p>
                <span>A little reasoning before the reveal.</span>
              </div>
            ) : (
              <svg
                viewBox="0 0 640 320"
                role="img"
                aria-label={`Trajectory: range ${result.range.toFixed(2)} meters and peak ${result.maxHeight.toFixed(2)} meters`}
              >
                <defs>
                  <pattern
                    id="trajectory-grid"
                    width="51"
                    height="44"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 51 0 L 0 0 0 44"
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity=".1"
                      strokeWidth="1"
                    />
                  </pattern>
                  <linearGradient
                    id="trajectory-fill"
                    x1="0"
                    y1="40"
                    x2="0"
                    y2="260"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="currentColor" stopOpacity=".18" />
                    <stop offset="1" stopColor="currentColor" stopOpacity=".01" />
                  </linearGradient>
                </defs>
                <rect x="60" y="40" width="510" height="220" fill="url(#trajectory-grid)" />
                <path d="M60 30 V260 H590" stroke="currentColor" strokeOpacity=".4" fill="none" />
                <path
                  d={`${path} L${60 + result.range * scale},260 Z`}
                  fill="url(#trajectory-fill)"
                />
                <path
                  d={`M${peakX} ${peakY}V260`}
                  stroke="currentColor"
                  strokeOpacity=".35"
                  strokeDasharray="4 5"
                />
                <path d={path} stroke="currentColor" strokeWidth="3" fill="none" />
                <circle cx={peakX} cy={peakY} r="12" fill="currentColor" fillOpacity=".1" />
                <circle cx={peakX} cy={peakY} r="4" fill="currentColor" />
                <circle cx="60" cy="260" r="4" fill="currentColor" />
                <circle cx={60 + result.range * scale} cy="260" r="4" fill="currentColor" />
                <text x="60" y="282">
                  0
                </text>
                <text x="290" y="310">
                  Distance (m)
                </text>
                <text x="12" y="24">
                  Height (m)
                </text>
                <text x="570" y="282" textAnchor="end">
                  {width.toFixed(1)}
                </text>
                <text x="12" y="50">
                  {height.toFixed(1)}
                </text>
              </svg>
            )}
          </div>
          <p className="plot-caption">
            Both axes use the same scale in meters. The view resizes to fit the launch.
          </p>
          {!hideResults && (
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
          )}
        </div>
        <div className="variable-panel">
          <span className="eyebrow">
            <Icon name="sliders" />
            THE VARIABLES
          </span>
          <h3>Make it move.</h3>
          <p className="note">Adjust one value. Notice what changes.</p>
          <div className="fields slider-fields">
            <label>
              <span className="variable-label">
                Initial speed{' '}
                <output>
                  {model.velocity} <small>m/s</small>
                </output>
              </span>
              <input
                aria-label="Initial speed"
                type="range"
                min="0"
                max="100"
                step="any"
                value={model.velocity}
                onChange={(e) => onChange({ ...model, velocity: Number(e.target.value) })}
              />
              <span className="range-limits">
                <span>0 m/s</span>
                <span>100 m/s</span>
              </span>
            </label>
            <label>
              <span className="variable-label">
                Launch angle{' '}
                <output>
                  {model.angle}
                  <small>°</small>
                </output>
              </span>
              <input
                aria-label="Launch angle"
                type="range"
                min="0"
                max="90"
                step="any"
                value={model.angle}
                onChange={(e) => onChange({ ...model, angle: Number(e.target.value) })}
              />
              <span className="range-limits">
                <span>0°</span>
                <span>90°</span>
              </span>
            </label>
          </div>
          <div className="formula-note">
            <span>THE RELATIONSHIP</span>
            <p>R = v₀² sin(2θ) / g</p>
          </div>
          <p className="note">
            Gravity: {model.gravity} m/s². Launch and landing are at the same height; air resistance
            is ignored.
          </p>
        </div>
      </div>
    </section>
  );
}
