import { type Config } from 'tailwindcss';

// Optional JS configuration for tooling. Tailwind 4 uses the stylesheet's CSS tokens.
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        body: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--canvas)',
        foreground: 'var(--ink)',
        border: 'var(--border)',
        primary: { DEFAULT: 'var(--green)', foreground: '#ffffff' },
        muted: { DEFAULT: 'var(--sage)', foreground: 'var(--muted)' },
        card: { DEFAULT: 'var(--surface)', foreground: 'var(--ink)' },
        sidebar: 'var(--sidebar)',
      },
    },
  },
  plugins: [],
} satisfies Config;
