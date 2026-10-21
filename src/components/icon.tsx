export type IconName =
  | 'lens'
  | 'lab'
  | 'library'
  | 'guide'
  | 'arrow'
  | 'upload'
  | 'check'
  | 'spark'
  | 'sliders'
  | 'target'
  | 'lock'
  | 'back';

const paths: Record<IconName, React.ReactNode> = {
  lens: (
    <>
      <ellipse cx="12" cy="12" rx="6" ry="10" transform="rotate(40 12 12)" />
      <ellipse cx="12" cy="12" rx="6" ry="10" transform="rotate(-40 12 12)" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3h6M10 3v6l-6 10a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2L14 9V3M7 15h10" />
      <path d="m10 18 .01 0m4-1 .01 0" />
    </>
  ),
  library: (
    <>
      <rect x="3" y="4" width="5" height="16" rx="1" />
      <path d="M11 4v16m4-15 4-1 4 15-4 1zM4 8h3" />
    </>
  ),
  guide: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 1.7-2.5 3.5m0 3h.01" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  upload: (
    <>
      <path d="M12 15V3m-4 4 4-4 4 4M4 15v5h16v-5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />,
  sliders: (
    <>
      <path d="M4 7h6m4 0h6M4 17h10m4 0h2" />
      <circle cx="12" cy="7" r="2" />
      <circle cx="16" cy="17" r="2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </>
  ),
  back: <path d="M19 12H5m6 6-6-6 6-6" />,
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
