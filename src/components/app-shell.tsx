'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './icon';

const navigation: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Learning lab', icon: 'lab' },
  { href: '/samples', label: 'Exercise library', icon: 'library' },
  { href: '/guide', label: 'How it works', icon: 'guide' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main">
        Skip to learning lab
      </a>
      <div className="workspace">
        <header className="product-header">
          <Link className="brand" href="/" aria-label="ConceptLens home">
            <span className="brand-mark">
              <Icon name="lens" />
            </span>
            <span>ConceptLens</span>
          </Link>
          <nav aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? 'product-nav-link active' : 'product-nav-link'}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <span className="header-note">A notebook for your next idea.</span>
        </header>
        {children}
        <footer className="workspace-footer">
          <span>
            <Icon name="lens" />
            Models run in your browser.
          </span>
          <Link href="/guide#your-data">
            <Icon name="lock" />
            Your data & privacy
          </Link>
        </footer>
      </div>
    </div>
  );
}
