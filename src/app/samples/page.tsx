import Link from 'next/link';
import { ExerciseLibrary } from '@/components/exercise-library';
import { Icon } from '@/components/icon';
import { exercises, exerciseTopics } from '@/lib/exercises';

export const metadata = {
  title: 'Exercise library | ConceptLens',
  description:
    'Explore six physics and math topics through graphs, explanations, and guided practice with progressive hints.',
};

export default function Samples() {
  const libraryExercises = exercises.map(
    ({ id, subject, topic, title, focus, difficulty, time }) => ({
      id,
      subject,
      topic,
      title,
      focus,
      difficulty,
      time,
    }),
  );

  return (
    <main id="main" className="main-content library-page">
      <div className="page-intro compact-intro library-intro">
        <span className="eyebrow">Exercise library</span>
        <h1>Practice by topic.</h1>
        <p>
          Choose a short exercise, study its graph and explanation, then work toward the solution
          one step at a time.
        </p>
      </div>

      <div className="library-heading">
        <div>
          <h2>Choose a topic</h2>
          <p>Every exercise is ready to use. No AI connection needed.</p>
        </div>
        <span className="count-label">{String(exercises.length).padStart(2, '0')} EXERCISES</span>
      </div>

      <ExerciseLibrary exercises={libraryExercises} topics={exerciseTopics} />

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
