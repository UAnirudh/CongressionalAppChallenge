'use client';
import { useId, useState } from 'react';
import { formatNumber } from './explorer-ui';

type Point = { x: number; y: number };
export type GraphSeries = {
  name: string;
  points: Point[];
  secondary?: boolean;
  auxiliary?: boolean;
};

export function ExplorerGraph({
  series,
  xLabel,
  yLabel,
  selected,
  onInspect,
  equalScale = false,
  description,
  legendHint = 'Hover or use the inspector below',
}: {
  series: GraphSeries[];
  xLabel: string;
  yLabel: string;
  selected?: Point;
  onInspect?: (index: number) => void;
  equalScale?: boolean;
  description: string;
  legendHint?: string | null;
}) {
  const clip = useId();
  const [zoom, setZoom] = useState(1);
  const points = series.flatMap((s) => s.points);
  let xMin = Math.min(0, ...points.map((p) => p.x)),
    xMax = Math.max(1, ...points.map((p) => p.x));
  let yMin = Math.min(0, ...points.map((p) => p.y)),
    yMax = Math.max(1, ...points.map((p) => p.y));
  const padX = Math.max(0.1, (xMax - xMin) * 0.07),
    padY = Math.max(0.1, (yMax - yMin) * 0.12);
  xMin -= padX;
  xMax += padX;
  yMin -= padY;
  yMax += padY;
  const plotWidth = 650,
    plotHeight = 330;
  if (equalScale) {
    const units = Math.max((xMax - xMin) / plotWidth, (yMax - yMin) / plotHeight);
    xMax = xMin + units * plotWidth;
    yMax = yMin + units * plotHeight;
  }
  const centerX = (xMax + xMin) / 2,
    centerY = (yMax + yMin) / 2;
  const spanX = (xMax - xMin) / zoom,
    spanY = (yMax - yMin) / zoom;
  xMin = centerX - spanX / 2;
  xMax = centerX + spanX / 2;
  yMin = centerY - spanY / 2;
  yMax = centerY + spanY / 2;
  const sx = (x: number) => 74 + ((x - xMin) / spanX) * plotWidth;
  const sy = (y: number) => 358 - ((y - yMin) / spanY) * plotHeight;
  const path = (data: Point[]) =>
    data.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x)},${sy(p.y)}`).join(' ');
  const ticks = Array.from({ length: 6 }, (_, i) => i / 5);
  return (
    <div className="explorer-graph">
      <div className="graph-tools" role="group" aria-label="Graph zoom">
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= 0.5}
          onClick={() => setZoom((z) => Math.max(0.5, z / 1.5))}
        >
          −
        </button>
        <button type="button" onClick={() => setZoom(1)}>
          Fit
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= 5}
          onClick={() => setZoom((z) => Math.min(5, z * 1.5))}
        >
          +
        </button>
      </div>
      <svg
        viewBox="0 0 760 420"
        role="img"
        aria-label={description}
        onPointerMove={(event) => {
          if (!onInspect) return;
          const box = event.currentTarget.getBoundingClientRect();
          const px = ((event.clientX - box.left) / box.width) * 760,
            py = ((event.clientY - box.top) / box.height) * 420;
          if (px < 74 || px > 724 || py < 28 || py > 358) return;
          let best = 0,
            distance = Infinity;
          series[0].points.forEach((p, i) => {
            const d = (sx(p.x) - px) ** 2 + (sy(p.y) - py) ** 2;
            if (d < distance) {
              distance = d;
              best = i;
            }
          });
          onInspect(best);
        }}
      >
        <defs>
          <clipPath id={clip}>
            <rect x="74" y="28" width={plotWidth} height={plotHeight} />
          </clipPath>
        </defs>
        {ticks.map((f) => (
          <g key={f} className="graph-tick">
            <path
              d={`M${74 + f * plotWidth} 28V358 M74 ${28 + f * plotHeight}H724`}
              className="graph-gridline"
            />
            <text x={74 + f * plotWidth} y="382" textAnchor="middle">
              {formatNumber(xMin + f * spanX)}
            </text>
            <text x="62" y={358 - f * plotHeight + 4} textAnchor="end">
              {formatNumber(yMin + f * spanY)}
            </text>
          </g>
        ))}
        <g clipPath={`url(#${clip})`}>
          <path d={`M${sx(0)} 28V358 M74 ${sy(0)}H724`} className="graph-zero" />
          {series.map((s) => (
            <path
              key={s.name}
              d={path(s.points)}
              className={
                s.secondary
                  ? 'graph-line secondary'
                  : s.auxiliary
                    ? 'graph-line auxiliary'
                    : 'graph-line'
              }
            />
          ))}
          {selected && (
            <g>
              <path
                d={`M${sx(selected.x)} 28V358 M74 ${sy(selected.y)}H724`}
                className="graph-crosshair"
              />
              <circle cx={sx(selected.x)} cy={sy(selected.y)} r="9" className="graph-point-halo" />
              <circle cx={sx(selected.x)} cy={sy(selected.y)} r="4.5" className="graph-point" />
            </g>
          )}
        </g>
        <text x="399" y="411" textAnchor="middle" className="axis-label">
          {xLabel}
        </text>
        <text x="74" y="17" className="axis-label">
          {yLabel}
        </text>
      </svg>
      <div className="graph-legend">
        {series.map((s) => (
          <span key={s.name}>
            <i className={s.secondary ? 'secondary' : s.auxiliary ? 'auxiliary' : ''} />
            {s.name}
          </span>
        ))}
        {legendHint && <span className="graph-hint">{legendHint}</span>}
      </div>
    </div>
  );
}
