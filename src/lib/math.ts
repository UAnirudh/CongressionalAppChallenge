import {
  linearSchema,
  projectileSchema,
  type Linear,
  type Problem,
  type Projectile,
} from './models';

export function projectile(input: Projectile) {
  const { velocity, angle, gravity } = projectileSchema.parse(input);
  const radians = (angle * Math.PI) / 180;
  // Snap the endpoints so floating-point cos(90 degrees) does not create a tiny range.
  const vx = angle === 90 ? 0 : velocity * Math.cos(radians);
  const vy = angle === 0 ? 0 : velocity * Math.sin(radians);
  // Solve y(t) = vy*t - g*t²/2 for the nonnegative return to launch height.
  const flightTime = (2 * vy) / gravity;
  const range = vx * flightTime;
  const maxHeight = (vy * vy) / (2 * gravity);
  const points = Array.from({ length: 81 }, (_, i) => {
    const t = (flightTime * i) / 80;
    return { x: vx * t, y: i === 80 ? 0 : Math.max(0, vy * t - (gravity * t * t) / 2) };
  });
  return { flightTime, range, maxHeight, points };
}
export function linearValue(input: Linear, x: number) {
  const model = linearSchema.parse(input);
  if (!Number.isFinite(x)) throw new Error('x must be finite.');
  return model.slope * x + model.intercept;
}

export function projectileState(input: Projectile, time: number) {
  const model = projectileSchema.parse(input);
  if (!Number.isFinite(time)) throw new Error('Time must be finite.');
  const radians = (model.angle * Math.PI) / 180;
  const vx = model.angle === 90 ? 0 : model.velocity * Math.cos(radians);
  const initialVy = model.angle === 0 ? 0 : model.velocity * Math.sin(radians);
  const flightTime = (2 * initialVy) / model.gravity;
  const t = Math.max(0, Math.min(time, flightTime));
  const vy = t === flightTime / 2 ? 0 : initialVy - model.gravity * t;
  return {
    t,
    x: vx * t,
    y: t === flightTime ? 0 : Math.max(0, initialVy * t - (model.gravity * t * t) / 2),
    vx,
    vy,
    speed: Math.hypot(vx, vy),
  };
}

export function projectileTable(input: Projectile, intervals = 80) {
  if (!Number.isInteger(intervals) || intervals < 1 || intervals > 1000)
    throw new Error('Use between 1 and 1000 intervals.');
  const { flightTime } = projectile(input);
  return Array.from({ length: intervals + 1 }, (_, i) =>
    projectileState(input, (flightTime * i) / intervals),
  );
}

export function linearIntercept(input: Linear) {
  const { slope, intercept } = linearSchema.parse(input);
  return slope === 0 ? null : -intercept / slope;
}
export function prediction(problem: Problem) {
  return problem.type === 'projectile_motion'
    ? {
        question: 'Predict the horizontal range in meters.',
        answer: projectile(problem).range,
        unit: 'm',
      }
    : { question: 'Predict y when x = 3.', answer: linearValue(problem, 3), unit: 'unitless' };
}
export function checkPrediction(answer: number, expected: number) {
  // Accept rounding to two decimals, with a 1% relative allowance for larger values.
  return (
    Number.isFinite(answer) &&
    Number.isFinite(expected) &&
    Math.abs(answer - expected) <= Math.max(0.01, Math.abs(expected) * 0.01)
  );
}
