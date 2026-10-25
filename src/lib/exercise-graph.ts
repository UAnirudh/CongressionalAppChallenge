import { linearValue, projectile } from './math';
import type { Exercise, ExerciseGraph } from './exercises';

export function getExerciseGraph(exercise: Exercise): ExerciseGraph {
  if (exercise.graph) return exercise.graph;
  const model = exercise.model;
  if (model.type === 'projectile_motion') {
    return {
      series: [{ name: 'Trajectory', points: projectile(model).points }],
      xLabel: 'horizontal distance (m)',
      yLabel: 'height (m)',
      description: `A graph of a projectile launched at ${model.velocity} meters per second and ${model.angle} degrees.`,
      caption: `Launch: ${model.velocity} m/s at ${model.angle}° above horizontal. Gravity: ${model.gravity} m/s². Air resistance is ignored, and launch and landing heights match.`,
      equalScale: true,
    };
  }
  return {
    series: [
      {
        name: 'y = mx + b',
        points: Array.from({ length: 41 }, (_, index) => {
          const x = index - 20;
          return { x, y: linearValue(model, x) };
        }),
      },
    ],
    xLabel: 'x (unitless)',
    yLabel: 'y (unitless)',
    description: `A graph of the line described in this problem: ${exercise.question}`,
    caption: 'A reference graph for this problem. Both x and y are unitless.',
  };
}
