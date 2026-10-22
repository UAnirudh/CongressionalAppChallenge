'use client';
import { useId, useRef, useState, type ReactNode } from 'react';

// Adapted from Watermelon UI tabs-1 and table-1. See THIRD_PARTY_NOTICES.md.
export function ViewTabs<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="view-tabs" role="tablist" aria-label="Graph view">
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(node) => {
            buttons.current[index] = node;
          }}
          type="button"
          role="tab"
          id={`${id}-${option.value}`}
          aria-controls={`${id}-panel`}
          aria-selected={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => {
            let next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % options.length;
            else if (event.key === 'ArrowLeft')
              next = (index + options.length - 1) % options.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = options.length - 1;
            else return;
            event.preventDefault();
            onChange(options[next].value);
            buttons.current[next]?.focus();
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function NumberControl({
  label,
  value,
  min,
  max,
  onChange,
  step = 'any',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number | 'any';
  onChange: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const errorId = useId();
  const [previous, setPrevious] = useState(value);
  if (value !== previous) {
    setPrevious(value);
    setDraft(String(value));
  }
  const valid =
    draft.trim() !== '' &&
    Number.isFinite(Number(draft)) &&
    Number(draft) >= min &&
    Number(draft) <= max;
  return (
    <label className="number-control">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft}
        aria-invalid={!valid}
        aria-label={label}
        aria-describedby={!valid ? errorId : undefined}
        onChange={(event) => {
          setDraft(event.target.value);
          if (event.target.value.trim() && event.target.validity.valid)
            onChange(Number(event.target.value));
        }}
      />
      {!valid && (
        <small className="error" id={errorId}>
          Enter {min} to {max}; the graph keeps the last valid value.
        </small>
      )}
    </label>
  );
}

export function DataTable({
  headers,
  rows,
  caption,
}: {
  headers: string[];
  rows: ReactNode[][];
  caption: string;
}) {
  return (
    <div className="data-table-wrap" tabIndex={0} role="region" aria-label={caption}>
      <table className="data-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function downloadCsv(filename: string, headers: string[], rows: number[][]) {
  const content = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatNumber(value: number) {
  if (value !== 0 && (Math.abs(value) < 0.01 || Math.abs(value) >= 10000))
    return value.toExponential(2);
  return Number(value.toFixed(2)).toLocaleString('en-US', { maximumFractionDigits: 2 });
}
