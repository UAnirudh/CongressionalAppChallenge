import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'ConceptLens | Explore the equation',
  description:
    'Explore projectile motion and linear functions through editable models and predictions.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
