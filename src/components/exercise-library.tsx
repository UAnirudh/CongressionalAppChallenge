'use client';

import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { Icon } from '@/components/icon';
import type { Exercise, ExerciseTopic } from '@/lib/exercises';

const collections = {
  Physics: {
    className: 'physics-collection',
  },
  Math: {
    className: 'math-collection',
  },
} as const;

type Subject = keyof typeof collections;
const subjects: Subject[] = ['Physics', 'Math'];
type LibraryExercise = Pick<
  Exercise,
  'id' | 'subject' | 'topic' | 'title' | 'focus' | 'difficulty' | 'time'
>;

export function ExerciseLibrary({
  exercises,
  topics,
}: {
  exercises: LibraryExercise[];
  topics: ExerciseTopic[];
}) {
  const libraryId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const topicRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeSubject, setActiveSubject] = useState<Subject>('Physics');
  const [activeTopics, setActiveTopics] = useState<Record<Subject, string>>(() => ({
    Physics: topics.find((topic) => topic.subject === 'Physics')?.name ?? '',
    Math: topics.find((topic) => topic.subject === 'Math')?.name ?? '',
  }));
  const currentCollection = collections[activeSubject];
  const subjectTopics = topics.filter((topic) => topic.subject === activeSubject);
  const currentTopic =
    subjectTopics.find((topic) => topic.name === activeTopics[activeSubject]) ?? subjectTopics[0];
  if (!currentTopic) return null;
  const collectionExercises = exercises.filter(
    (exercise) => exercise.subject === activeSubject && exercise.topic === currentTopic.name,
  );

  return (
    <div className="library-browser">
      <div className="collection-tabs" role="tablist" aria-label="Choose a subject collection">
        {subjects.map((subject, index) => {
          const count = exercises.filter((exercise) => exercise.subject === subject).length;
          const selected = activeSubject === subject;
          return (
            <button
              key={subject}
              ref={(button) => {
                tabRefs.current[index] = button;
              }}
              id={`${libraryId}-${subject}`}
              className={`collection-tab ${collections[subject].className}${selected ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${libraryId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveSubject(subject)}
              onKeyDown={(event) => {
                let nextIndex: number;
                if (event.key === 'ArrowRight') nextIndex = (index + 1) % subjects.length;
                else if (event.key === 'ArrowLeft')
                  nextIndex = (index + subjects.length - 1) % subjects.length;
                else if (event.key === 'Home') nextIndex = 0;
                else if (event.key === 'End') nextIndex = subjects.length - 1;
                else return;
                event.preventDefault();
                setActiveSubject(subjects[nextIndex]);
                tabRefs.current[nextIndex]?.focus();
              }}
            >
              <span className="collection-tab-copy">
                <span>{subject}</span>
                <small>{topics.filter((topic) => topic.subject === subject).length} topics</small>
              </span>
              <span className="collection-tab-count">{String(count).padStart(2, '0')}</span>
            </button>
          );
        })}
      </div>

      <section
        id={`${libraryId}-panel`}
        role="tabpanel"
        tabIndex={0}
        className={`collection-panel ${currentCollection.className}`}
        aria-labelledby={`${libraryId}-${activeSubject}`}
      >
        <div
          className="library-topic-picker"
          role="radiogroup"
          aria-label={`${activeSubject} topics`}
        >
          {subjectTopics.map((topic, index) => {
            const selected = topic.name === currentTopic.name;
            return (
              <button
                key={topic.name}
                ref={(button) => {
                  topicRefs.current[index] = button;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() =>
                  setActiveTopics((previous) => ({ ...previous, [activeSubject]: topic.name }))
                }
                onKeyDown={(event) => {
                  let nextIndex: number;
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
                    nextIndex = (index + 1) % subjectTopics.length;
                  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
                    nextIndex = (index + subjectTopics.length - 1) % subjectTopics.length;
                  else if (event.key === 'Home') nextIndex = 0;
                  else if (event.key === 'End') nextIndex = subjectTopics.length - 1;
                  else return;
                  event.preventDefault();
                  const nextTopic = subjectTopics[nextIndex];
                  if (!nextTopic) return;
                  setActiveTopics((previous) => ({ ...previous, [activeSubject]: nextTopic.name }));
                  topicRefs.current[nextIndex]?.focus();
                }}
              >
                {topic.name}
                <span>
                  {
                    exercises.filter(
                      (exercise) =>
                        exercise.subject === activeSubject && exercise.topic === topic.name,
                    ).length
                  }
                </span>
              </button>
            );
          })}
        </div>
        <header className="collection-panel-heading">
          <div>
            <span className="collection-kicker">{activeSubject.toUpperCase()} COLLECTION</span>
            <h2 id="active-collection-heading">{currentTopic.name}</h2>
            <p>{currentTopic.description}</p>
          </div>
          <span className="collection-count">{collectionExercises.length} guided exercises</span>
        </header>

        <div className="collection-exercises">
          {collectionExercises.map((exercise, index) => (
            <Link
              key={exercise.id}
              href={`/samples/${exercise.id}`}
              className="library-exercise-card"
            >
              <div className="library-card-topline">
                <span className="exercise-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="exercise-meta">
                  {exercise.difficulty} <span aria-hidden="true">·</span> {exercise.time}
                </span>
              </div>
              <h3>{exercise.title}</h3>
              <p>{exercise.focus}</p>
              <span className="library-card-open">
                Practice <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
