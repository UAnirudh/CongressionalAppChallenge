import Link from 'next/link';
import { ConceptArt } from '@/components/concept-art';
import { Icon } from '@/components/icon';

export const metadata = {
  title: 'Exercise library | ConceptLens',
  description:
    'Explore projectile motion and linear functions with ready-to-use interactive exercises.',
};

export default function Samples() {
  return (
    <main id="main" className="main-content library-page">
      <div className="page-intro">
        <span className="eyebrow">THE EXERCISE LIBRARY</span>
        <h1>
          Small questions.
          <br />
          <em>Big discoveries.</em>
        </h1>
        <p>
          A starting point for your next “aha.” Pick an exercise, make it your own, and follow your
          curiosity.
        </p>
      </div>
      <div className="library-heading">
        <h2>Ready to explore</h2>
        <span className="count-label">02 EXERCISES</span>
      </div>
      <div className="library-grid">
        <Link href="/?sample=projectile" className="exercise-card">
          <div className="exercise-visual">
            <span className="subject-tag">PHYSICS · 01</span>
            <ConceptArt />
          </div>
          <div className="exercise-body">
            <span className="eyebrow">PROJECTILE MOTION</span>
            <h2>A ball in flight</h2>
            <p>Launch at 20 m/s and 45°. Explore how speed and angle shape the journey.</p>
            <div className="exercise-equation">R = v² sin(2θ) / g</div>
            <span className="exercise-cta">
              Explore this exercise <Icon name="arrow" />
            </span>
          </div>
        </Link>
        <Link href="/?sample=linear" className="exercise-card">
          <div className="exercise-visual linear-visual">
            <span className="subject-tag">MATHEMATICS · 02</span>
            <ConceptArt variant="linear" />
          </div>
          <div className="exercise-body">
            <span className="eyebrow">LINEAR FUNCTIONS</span>
            <h2>A line with a pattern</h2>
            <p>Start with y = 2x + 1. Change the slope and intercept to see the relationship.</p>
            <div className="exercise-equation">y = mx + b</div>
            <span className="exercise-cta">
              Explore this exercise <Icon name="arrow" />
            </span>
          </div>
        </Link>
      </div>
      <div className="library-note">
        <Icon name="spark" />
        <div>
          <h3>Have a question of your own?</h3>
          <p>Bring a projectile motion or linear function problem into the learning lab.</p>
        </div>
        <Link className="text-link" href="/">
          Open the lab <Icon name="arrow" />
        </Link>
      </div>
    </main>
  );
}
