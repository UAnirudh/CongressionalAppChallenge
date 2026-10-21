export function ConceptArt({ variant = 'projectile' }: { variant?: 'projectile' | 'linear' }) {
  const linear = variant === 'linear';
  return (
    <svg className="concept-art" viewBox="0 0 460 260" fill="none" aria-hidden="true">
      <defs>
        <pattern id={`art-grid-${variant}`} width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" stroke="currentColor" strokeOpacity=".10" />
        </pattern>
        <linearGradient
          id={`art-fill-${variant}`}
          x1="230"
          y1="45"
          x2="230"
          y2="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity=".12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="20" y="12" width="420" height="225" fill={`url(#art-grid-${variant})`} />
      <path d="M42 28V219H431" stroke="currentColor" strokeOpacity=".4" />
      <path d="m38 34 4-6 4 6m379 181 6 4-6 4" stroke="currentColor" strokeOpacity=".4" />
      <path
        d={linear ? 'M75 210 360 40 360 219H75Z' : 'M55 219Q230 -94 405 219Z'}
        fill={`url(#art-fill-${variant})`}
      />
      <path
        className="art-curve"
        d={linear ? 'M75 210 360 40' : 'M55 219Q230 -94 405 219'}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {!linear && (
        <>
          <path d="M230 62V219" stroke="currentColor" strokeOpacity=".35" strokeDasharray="4 5" />
          <circle cx="230" cy="62.5" r="15" fill="currentColor" fillOpacity=".09" />
          <circle cx="230" cy="62.5" r="5" fill="currentColor" />
          <path d="M251 60h24" stroke="currentColor" strokeOpacity=".5" />
          <text x="284" y="64">
            a new perspective
          </text>
        </>
      )}
      {linear && (
        <>
          <circle cx="219" cy="124" r="13" fill="currentColor" fillOpacity=".1" />
          <circle cx="219" cy="124" r="5" fill="currentColor" />
          <path
            d="M219 124h67v-40"
            stroke="currentColor"
            strokeDasharray="4 4"
            strokeOpacity=".5"
          />
          <text x="296" y="109">
            rise / run
          </text>
        </>
      )}
      <circle cx="55" cy="219" r="4" fill="currentColor" />
      <text x="24" y="239">
        0
      </text>
      <text x="420" y="240">
        x
      </text>
      <text x="25" y="31">
        y
      </text>
      <text className="art-equation" x="65" y="50">
        {linear ? 'y = mx + b' : 'what if θ changed?'}
      </text>
    </svg>
  );
}
