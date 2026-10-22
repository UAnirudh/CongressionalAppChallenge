import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AppShell } from '@/components/app-shell';
import './globals.css';
const sans = localFont({
  src: './fonts/ibm-plex-sans-latin.woff2',
  weight: '400 600',
  display: 'swap',
  variable: '--font-sans',
});
const mono = localFont({
  src: [
    { path: './fonts/ibm-plex-mono-regular-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-mono-medium-latin.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-mono',
});
export const metadata: Metadata = {
  title: 'ConceptLens | Explore the equation',
  description:
    'Explore projectile motion and linear functions through editable models and predictions.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
