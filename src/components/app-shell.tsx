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
  const current = navigation.find((item) => item.href === pathname);
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main">
        Skip to learning lab
      </a>
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="ConceptLens home">
          <span className="brand-mark">
            <Icon name="lens" />
          </span>
          <span>
            Concept<span className="brand-light">Lens</span>
            <small>A different way to see.</small>
          </span>
        </Link>
        <span className="nav-caption">YOUR WORKSPACE</span>
        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'nav-item active' : 'nav-item'}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {pathname === item.href && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="curiosity-note">
            <Icon name="spark" />
            <p>
              Big ideas start with
              <br />a small “what if?”
            </p>
            <span>Keep exploring.</span>
          </div>
          <div className="workspace-signature">
            <span className="student-avatar">
              C<span>✦</span>
            </span>
            <div>
              Your space to explore<small>No account needed</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-header">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{current?.label ?? 'ConceptLens'}</strong>
          </div>
          <span className="session-badge">
            <span />
            Made for curious minds
          </span>
        </header>
        {children}
        <footer className="workspace-footer">
          <span>
            <Icon name="lens" />A little curiosity goes a long way.
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
