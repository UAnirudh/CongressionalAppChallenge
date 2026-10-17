import { ProblemWorkbench } from '@/components/problem-workbench';
import Link from 'next/link';
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to learning lab
      </a>
      <header className="site-header">
        <Link href="/" aria-label="ConceptLens home">
          <span className="brand-icon" aria-hidden="true">
            ◉
          </span>{' '}
          ConceptLens
        </Link>
        <span>Student STEM lab</span>
      </header>
      <main id="main" className="shell">
        <div className="hero">
          <h1>
            What if you changed
            <br />
            the equation?
          </h1>
          <p>
            Turn a problem into something you can explore. Adjust a variable, make a prediction, and
            see the mathematics respond.
          </p>
          <p className="supported">Projectile motion & linear functions</p>
        </div>
        <ProblemWorkbench />
      </main>
      <footer className="shell">
        Built for conceptual understanding. Mathematical results are calculated deterministically in
        your browser.
      </footer>
    </>
  );
}
