import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { AppShell } from '@/components/app-shell';
import './globals.css';
const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist' });
export const metadata: Metadata = {
  title: 'ConceptLens | Explore the equation',
  description:
    'Explore projectile motion and linear functions through editable models and predictions.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
