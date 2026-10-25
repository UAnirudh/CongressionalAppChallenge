import { describe, expect, it } from 'vitest';
import { exerciseById, exercises, exerciseTopics } from '../src/lib/exercises';
import { getExerciseGraph } from '../src/lib/exercise-graph';

describe('curated exercises', () => {
  it.each([
    ['motion-constant-speed', 60],
    ['motion-acceleration', 12],
    ['motion-area-under-velocity', 25],
    ['force-cart', 15],
    ['energy-kinetic', 16],
    ['energy-potential', 58.86],
    ['quadratic-value', 8],
    ['quadratic-vertex', 3],
    ['quadratic-positive-root', 3],
    ['exponential-growth', 48],
    ['exponential-decay', 10],
    ['exponential-solve', 5],
    ['projectile-horizontal-position', 10],
    ['projectile-height-at-time', 3.77375],
    ['projectile-vertical-velocity', 5.19],
    ['linear-negative-slope', -4],
    ['linear-find-input', 4],
    ['linear-intersection', 2],
    ['motion-average-speed', 5],
    ['motion-braking-time', 4],
    ['motion-speed-conversion', 20],
    ['force-find-acceleration', 4],
    ['energy-work', 36],
    ['energy-spring', 2],
    ['quadratic-minimum', -4],
    ['quadratic-negative-root', -3],
    ['quadratic-symmetry', 3],
    ['exponential-initial-value', 7],
    ['exponential-negative-input', 4],
    ['exponential-decay-input', 3],
  ] as const)('%s has the correct worked answer', (id, expected) => {
    expect(exerciseById(id)?.answer).toBeCloseTo(expected, 8);
  });

  it('gives every exercise a registered topic and a finite, ordered graph', () => {
    expect(new Set(exercises.map(({ id }) => id)).size).toBe(exercises.length);
    for (const exercise of exercises) {
      expect(
        exerciseTopics.some(
          (topic) => topic.subject === exercise.subject && topic.name === exercise.topic,
        ),
      ).toBe(true);
      expect(Number.isFinite(exercise.answer)).toBe(true);
      const graph = getExerciseGraph(exercise);
      expect(graph.xLabel.length).toBeGreaterThan(0);
      expect(graph.yLabel.length).toBeGreaterThan(0);
      for (const series of graph.series) {
        expect(series.points.length).toBeGreaterThan(1);
        series.points.forEach((point, index) => {
          expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true);
          if (index) expect(point.x).toBeGreaterThanOrEqual(series.points[index - 1].x);
        });
      }
    }
  });

  it('uses force and energy axes for the new physics graphs', () => {
    const force = getExerciseGraph(exerciseById('force-cart')!);
    expect(force.xLabel).toBe('acceleration (m/s²)');
    expect(force.yLabel).toBe('net force (N)');
    expect(force.series[0].points.at(-1)?.y).toBe(25);
    const energy = getExerciseGraph(exerciseById('energy-kinetic')!);
    expect(energy.yLabel).toBe('kinetic energy (J)');
    expect(energy.series[0].points.at(-1)?.y).toBe(36);
  });

  it('shows both lines for an intersection and signed velocity for a projectile', () => {
    const intersection = getExerciseGraph(exerciseById('linear-intersection')!);
    expect(intersection.series).toHaveLength(2);
    expect(intersection.series[1].secondary).toBe(true);
    expect(intersection.series[0].points[0].y).toBe(-3);
    expect(intersection.series[1].points[0].y).toBe(9);
    const velocity = getExerciseGraph(exerciseById('projectile-vertical-velocity')!);
    expect(velocity.xLabel).toBe('time (s)');
    expect(velocity.yLabel).toBe('vertical velocity (m/s)');
    expect(velocity.series[0].points[0].y).toBe(15);
    expect(velocity.series[0].points.at(-1)?.y).toBeCloseTo(-15);
  });
});
