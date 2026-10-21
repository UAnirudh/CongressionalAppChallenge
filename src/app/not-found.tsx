import Link from 'next/link';
import { Icon } from '@/components/icon';

export default function NotFound() {
  return (
    <main id="main" className="main-content">
      <div className="page-intro">
        <span className="eyebrow">404 / A LITTLE OFF COURSE</span>
        <h1>
          A new question.
          <br />
          <em>A missing page.</em>
        </h1>
        <p>This page doesn’t exist. There’s still plenty to explore back in the learning lab.</p>
      </div>
      <Link href="/" className="button button-primary">
        <Icon name="back" />
        Back to the lab
      </Link>
    </main>
  );
}
