import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExerciseDetail } from '@/components/exercise-detail';
import { exerciseById, exercises } from '@/lib/exercises';

export function generateStaticParams() {
  return exercises.map(({ id }) => ({ exerciseId: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}): Promise<Metadata> {
  const { exerciseId } = await params;
  const exercise = exerciseById(exerciseId);
  return {
    title: exercise ? `${exercise.title} | ConceptLens` : 'Exercise | ConceptLens',
    description: exercise?.question ?? 'A guided ConceptLens practice exercise.',
  };
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const exercise = exerciseById(exerciseId);
  if (!exercise) notFound();

  return <ExerciseDetail exercise={exercise} />;
}
