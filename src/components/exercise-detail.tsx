import Link from 'next/link';
import { ExplorerGraph } from '@/components/explorer-graph';
import { Icon } from '@/components/icon';
import { ExercisePractice } from '@/components/exercise-practice';
import { getExerciseGraph } from '@/lib/exercise-graph';
import type { Exercise } from '@/lib/exercises';

export function ExerciseDetail({ exercise }: { exercise: Exercise }) {
  const isPhysics = exercise.subject === 'Physics';
  const graph = getExerciseGraph(exercise);
  const { id, question, hints, solution, answer, answerUnit, answerLabel } = exercise;

  return (
    <main id="main" className="main-content exercise-detail-page">
      <div className="exercise-backline">
        <Link href="/samples">
          <Icon name="back" />
          Exercise library
        </Link>
        <span>{exercise.topic}</span>
      </div>

      <header className="exercise-detail-heading">
        <div>
          <span className={`subject-tag ${isPhysics ? 'physics-tag' : 'math-tag'}`}>
            {exercise.subject} · {exercise.topic}
          </span>
          <h1>{exercise.title}</h1>
          <p>{exercise.question}</p>
        </div>
        <div
          className="exercise-detail-meta"
          aria-label={`${exercise.difficulty}, ${exercise.time}`}
        >
          <span>{exercise.difficulty}</span>
          <span>{exercise.time}</span>
        </div>
      </header>

      <div className="exercise-detail-grid">
        <section className="exercise-preview-card" aria-labelledby="preview-heading">
          <div className="exercise-card-heading">
            <div>
              <span className="eyebrow">A quick look</span>
              <h2 id="preview-heading">See the relationship</h2>
            </div>
            <span className="exercise-equation">{exercise.equation}</span>
          </div>
          <ExplorerGraph
            series={graph.series}
            xLabel={graph.xLabel}
            yLabel={graph.yLabel}
            description={graph.description}
            equalScale={graph.equalScale}
            legendHint="Use zoom to take a closer look"
          />
          <p className="exercise-graph-caption">{graph.caption}</p>
        </section>

        <aside className="exercise-explanation-card" aria-labelledby="explanation-heading">
          <span className="eyebrow">The idea behind it</span>
          <h2 id="explanation-heading">What to notice</h2>
          {exercise.explanation.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="exercise-focus-note">
            <Icon name="target" />
            <span>{exercise.focus}</span>
          </div>
        </aside>
      </div>

      <section className="exercise-practice-section" aria-labelledby="practice-heading">
        <div className="practice-section-heading">
          <div>
            <span className="eyebrow">Your turn</span>
            <h2 id="practice-heading">Work it out step by step.</h2>
            <p>Try it yourself first. If you get stuck, unlock one hint at a time.</p>
          </div>
        </div>
        <ExercisePractice
          exercise={{ id, question, hints, solution, answer, answerUnit, answerLabel }}
        />
      </section>
    </main>
  );
}
