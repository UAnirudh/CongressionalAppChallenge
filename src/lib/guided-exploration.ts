import { linearValue, projectile, projectileState } from './math';
import type { Problem } from './models';

export type ExplorationStep = {
  title: string;
  idea: string;
  question: string;
  answer: number;
  unit: string;
  hints: string[];
  working: string[];
  takeaway: string;
};

export function showValue(value: number) {
  if (value === 0) return '0';
  if (Math.abs(value) < 0.01) return value.toExponential(3);
  return Number(value.toFixed(4)).toString();
}

export function modelSignature(model: Problem) {
  return model.type === 'linear_function'
    ? `linear:${model.slope}:${model.intercept}`
    : `projectile:${model.velocity}:${model.angle}:${model.gravity}`;
}

export function describeModel(model: Problem) {
  return model.type === 'linear_function'
    ? `y = ${showValue(model.slope)}x ${model.intercept < 0 ? '−' : '+'} ${showValue(Math.abs(model.intercept))}`
    : `${showValue(model.velocity)} m/s · ${showValue(model.angle)}° · g = ${showValue(model.gravity)} m/s²`;
}

export function createExploration(model: Problem): {
  steps: ExplorationStep[];
  changedModel: Problem;
  changeLabel: string;
  comparison: string;
} {
  if (model.type === 'linear_function') {
    const m = showValue(model.slope);
    const b = showValue(model.intercept);
    const atOne = linearValue(model, 1);
    const atThree = linearValue(model, 3);
    const shift = model.intercept <= 998 ? 2 : -2;
    const changedModel = { ...model, intercept: model.intercept + shift };
    const changedY = linearValue(changedModel, 3);
    const direction = shift > 0 ? 'up' : 'down';
    return {
      changedModel,
      changeLabel: `Change the intercept from ${b} to ${showValue(changedModel.intercept)}`,
      comparison: `The whole line moves ${direction} by 2. At x = 3, y changes from ${showValue(atThree)} to ${showValue(changedY)}. Its slope stays ${m}.`,
      steps: [
        {
          title: 'Find the starting point',
          idea: 'The y-intercept tells you where a line crosses the vertical axis. Every point on that axis has x = 0.',
          question: 'What is y when x = 0?',
          answer: model.intercept,
          unit: 'unitless',
          hints: [
            'Substitute 0 for x in y = mx + b.',
            'The slope term becomes m × 0 = 0, leaving only b.',
          ],
          working: [`y(0) = (${m}) × 0 + (${b})`, `y(0) = ${b}`],
          takeaway: `The line crosses the y-axis at (0, ${b}).`,
        },
        {
          title: 'Read the rate of change',
          idea: 'Slope measures the change in y for each increase of 1 in x. Its sign tells you whether the line rises, falls, or stays flat.',
          question: 'As x goes from 0 to 1, what is the change in y? Include the sign.',
          answer: model.slope,
          unit: 'unitless',
          hints: [
            'Calculate y at x = 1, then subtract y at x = 0.',
            'Change in y = (m + b) − b. The intercept cancels out.',
          ],
          working: [
            `y(1) = (${m}) × 1 + (${b}) = ${showValue(atOne)}`,
            `Δy = ${showValue(atOne)} − (${b}) = ${m}`,
          ],
          takeaway:
            model.slope === 0
              ? 'The slope is zero, so the line is horizontal.'
              : `For each +1 in x, y ${model.slope > 0 ? 'increases' : 'decreases'} by ${showValue(Math.abs(model.slope))}.`,
        },
        {
          title: 'Find another point',
          idea: 'Start at the intercept, then use the slope for each step along x. The same equation gives every point on this line.',
          question: 'What is y when x = 3?',
          answer: atThree,
          unit: 'unitless',
          hints: [
            'Substitute 3 for x in y = mx + b.',
            'Multiply the slope by 3 first, then add the intercept.',
          ],
          working: [
            `y(3) = (${m}) × 3 + (${b})`,
            `y(3) = ${showValue(model.slope * 3)} + (${b}) = ${showValue(atThree)}`,
          ],
          takeaway: `The point (3, ${showValue(atThree)}) lies on the line.`,
        },
        {
          title: 'Predict a change, then compare',
          idea: `Keep the slope fixed and move the intercept ${direction} by 2. Predict the new point before applying the change to your model.`,
          question: `With b = ${showValue(changedModel.intercept)}, what will y be at x = 3?`,
          answer: changedY,
          unit: 'unitless',
          hints: [
            `Keep m = ${m}; only b changes.`,
            `The old y-value was ${showValue(atThree)}. Move it ${direction} by 2.`,
          ],
          working: [
            `New y(3) = (${m}) × 3 + (${showValue(changedModel.intercept)})`,
            `New y(3) = ${showValue(changedY)}`,
          ],
          takeaway:
            'Changing the intercept shifts every y-value by the same amount. It does not change the slope.',
        },
      ],
    };
  }

  const launch = projectileState(model, 0);
  const result = projectile(model);
  const velocity =
    model.velocity === 0 ? 10 : model.velocity <= 50 ? model.velocity * 2 : model.velocity / 2;
  const changedModel = { ...model, velocity };
  const changedResult = projectile(changedModel);
  const change =
    model.velocity === 0
      ? 'Set the starting speed to 10 m/s'
      : model.velocity <= 50
        ? 'Double the starting speed'
        : 'Halve the starting speed';
  const zeroFlight = model.angle === 0 || model.velocity === 0;
  const comparison =
    model.angle === 0
      ? 'At a 0° launch angle, this same-height model has no time in the air. Raising the launch angle would create a flight path.'
      : model.angle === 90
        ? 'At 90°, the launch is straight up, so the horizontal range stays zero. Changing speed changes the height and flight time.'
        : model.velocity === 0
          ? `The object now launches at 10 m/s. Its horizontal range is ${showValue(changedResult.range)} m.`
          : `With angle and gravity fixed, range scales with speed squared. ${model.velocity <= 50 ? 'Doubling speed makes the range four times as large' : 'Halving speed makes the range one quarter as large'}: ${showValue(result.range)} m → ${showValue(changedResult.range)} m.`;
  return {
    changedModel,
    changeLabel: `${change}: ${showValue(model.velocity)} → ${showValue(velocity)} m/s`,
    comparison,
    steps: [
      {
        title: 'Split the launch into two directions',
        idea: 'Forward motion and upward motion happen together. The launch angle splits the starting speed into horizontal and vertical components.',
        question: 'What is the initial upward velocity? Use degrees for the angle.',
        answer: launch.vy,
        unit: 'm/s',
        hints: [
          'The upward component is vᵧ₀ = v₀ sin(θ).',
          `Use sin(${showValue(model.angle)}°), then multiply by ${showValue(model.velocity)} m/s. Make sure your calculator is in degree mode.`,
        ],
        working: [
          `vᵧ₀ = ${showValue(model.velocity)} × sin(${showValue(model.angle)}°)`,
          `vᵧ₀ ≈ ${showValue(launch.vy)} m/s`,
        ],
        takeaway: `The forward component is ${showValue(launch.vx)} m/s. Gravity changes the vertical component while the horizontal component stays constant.`,
      },
      {
        title: 'Work out the time in the air',
        idea: zeroFlight
          ? 'With no upward launch velocity, this same-height model returns to the ground immediately.'
          : 'Gravity reduces the upward velocity to zero at the highest point. Returning to the launch height takes the same amount of time on the way down.',
        question: 'How long is the full flight?',
        answer: result.flightTime,
        unit: 's',
        hints: [
          'The time to the highest point is vᵧ₀ ÷ g.',
          'For equal launch and landing heights, double that time: T = 2vᵧ₀ ÷ g.',
        ],
        working: [
          `T = 2 × vᵧ₀ ÷ g`,
          `T = 2 × (${showValue(model.velocity)} × sin(${showValue(model.angle)}°)) ÷ ${showValue(model.gravity)} ≈ ${showValue(result.flightTime)} s`,
        ],
        takeaway:
          'This flight-time formula assumes equal launch and landing heights and no air resistance.',
      },
      {
        title: 'Connect time to horizontal distance',
        idea: 'There is no horizontal acceleration in this model. Horizontal distance is the constant forward velocity multiplied by the time in the air.',
        question: 'What horizontal range does the object travel?',
        answer: result.range,
        unit: 'm',
        hints: [
          'Use R = vₓ × T.',
          `Use vₓ = ${showValue(launch.vx)} m/s and T = ${showValue(result.flightTime)} s. Keep full precision until the final answer.`,
        ],
        working: [
          `R = vₓ × T`,
          `R ≈ ${showValue(launch.vx)} × ${showValue(result.flightTime)} ≈ ${showValue(result.range)} m`,
        ],
        takeaway:
          model.angle === 90
            ? 'A straight-up launch has zero horizontal velocity and therefore zero horizontal range.'
            : 'The object covers this distance while gravity brings it back to its starting height.',
      },
      {
        title: 'Predict a change, then compare',
        idea: `${change}, keeping the launch angle and gravity fixed. Predict what happens before applying the change.`,
        question: `At ${showValue(velocity)} m/s, what will the new horizontal range be?`,
        answer: changedResult.range,
        unit: 'm',
        hints: [
          'For this same-height model, R = v₀² sin(2θ) ÷ g. Range scales with speed squared.',
          model.velocity === 0
            ? 'Use 10 m/s in the range formula.'
            : `Multiply the old range by ${model.velocity <= 50 ? '4' : '0.25'}. A straight-up or 0° launch still has zero horizontal range.`,
        ],
        working: [
          `New T = 2 × (${showValue(velocity)} × sin(${showValue(model.angle)}°)) ÷ ${showValue(model.gravity)} ≈ ${showValue(changedResult.flightTime)} s`,
          `New R = (${showValue(velocity)} × cos(${showValue(model.angle)}°)) × new T ≈ ${showValue(changedResult.range)} m`,
        ],
        takeaway: comparison,
      },
    ],
  };
}
