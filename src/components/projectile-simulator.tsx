'use client';
import { projectile } from '@/lib/math';
import type { Projectile } from '@/lib/models';

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
  return (
    <section aria-labelledby="simulation-heading">
      <h2 id="simulation-heading" tabIndex={-1}>
        Projectile motion
      </h2>
      <p>Change the launch. Watch the path respond.</p>
      <p className="note">
        Gravity: {model.gravity} m/s². Launch and landing are at the same height; air resistance is
        ignored.
      </p>
      <div className="plot projectile-plot">
        {hideResults ? (
          <p className="p-8">Make your prediction to reveal the path.</p>
        ) : (
          <svg
            viewBox="0 0 640 320"
            role="img"
            aria-label={`Trajectory: range ${result.range.toFixed(2)} meters and peak ${result.maxHeight.toFixed(2)} meters`}
          >
            <defs>
              <pattern id="grid" width="51" height="44" patternUnits="userSpaceOnUse">
                <path d="M 51 0 L 0 0 0 44" fill="none" stroke="#dce7f4" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x="60" y="40" width="510" height="220" fill="url(#grid)" />
            <path d="M60 30 V260 H590" stroke="#5d7390" fill="none" />
            {!hideResults && <path d={path} stroke="#1d61cd" strokeWidth="4" fill="none" />}
            <text x="60" y="282">
              0
            </text>
            <text x="290" y="310">
              Distance (m)
            </text>
            <text x="12" y="24">
              Height (m)
            </text>
            {!hideResults && (
              <>
                <text x="570" y="282" textAnchor="end">
                  {width.toFixed(1)}
                </text>
                <text x="12" y="50">
                  {height.toFixed(1)}
                </text>
              </>
            )}
          </svg>
        )}
      </div>
      <p className="note">
        Both axes use the same scale in meters. The view resizes to fit the launch; compare the
        labels and measurements.
      </p>
      <div className="fields">
        <label>
          Initial speed: {model.velocity} m/s
          <input
            aria-label="Initial speed"
            type="range"
            min="0"
            max="100"
            step="any"
            value={model.velocity}
            onChange={(e) => onChange({ ...model, velocity: Number(e.target.value) })}
          />
        </label>
        <label>
          Launch angle: {model.angle}°
          <input
            aria-label="Launch angle"
            type="range"
            min="0"
            max="90"
            step="any"
            value={model.angle}
            onChange={(e) => onChange({ ...model, angle: Number(e.target.value) })}
          />
        </label>
      </div>
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
    </section>
  );
}
