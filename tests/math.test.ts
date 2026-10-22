import { describe, expect, it } from 'vitest';
import {
  checkPrediction,
  linearValue,
  linearIntercept,
  prediction,
  projectile,
  projectileState,
  projectileTable,
} from '../src/lib/math';
import { samples, type Projectile, type Linear } from '../src/lib/models';
const p = samples[0] as Projectile;
describe('projectile equations', () => {
  it('matches a known 45 degree launch', () => {
    const result = projectile(p);
    expect(result.range).toBeCloseTo(400 / 9.81, 8);
    expect(result.flightTime).toBeCloseTo((2 * 20 * Math.SQRT1_2) / 9.81, 8);
    expect(result.maxHeight).toBeCloseTo(100 / 9.81, 8);
    expect(result.points.at(-1)?.y).toBe(0);
  });
  it('handles rest, horizontal, and vertical launches', () => {
    expect(projectile({ ...p, velocity: 0 }).flightTime).toBe(0);
    expect(projectile({ ...p, angle: 0 }).range).toBe(0);
    expect(projectile({ ...p, angle: 90 }).range).toBe(0);
  });
  it('gives equal ranges for complementary angles', () => {
    expect(projectile({ ...p, angle: 30 }).range).toBeCloseTo(
      projectile({ ...p, angle: 60 }).range,
      8,
    );
  });
  it('rejects invalid inputs before calculation', () => {
    for (const gravity of [0, -1, NaN, Infinity])
      expect(() => projectile({ ...p, gravity })).toThrow();
  });
});
it('evaluates negative and zero slopes', () => {
  expect(linearValue({ ...(samples[1] as Linear), slope: -2 }, 3)).toBe(-5);
  expect(linearValue({ ...(samples[1] as Linear), slope: 0 }, 3)).toBe(1);
});
it('checks predictions deterministically with rounding tolerance', () => {
  expect(prediction(samples[1]).answer).toBe(7);
  expect(checkPrediction(7, 7)).toBe(true);
  expect(checkPrediction(8, 7)).toBe(false);
  expect(checkPrediction(0.009, 0)).toBe(true);
  expect(checkPrediction(NaN, 7)).toBe(false);
});

describe('flight inspector and exported data', () => {
  it('reports zero vertical velocity at the peak and conserves ideal mechanical energy', () => {
    const { flightTime, maxHeight } = projectile(p);
    const peak = projectileState(p, flightTime / 2);
    expect(peak.vy).toBeCloseTo(0, 10);
    expect(peak.y).toBeCloseTo(maxHeight, 10);
    for (const state of projectileTable(p)) {
      expect(state.speed ** 2 / 2 + p.gravity * state.y).toBeCloseTo(p.velocity ** 2 / 2, 8);
      expect(state.vx).toBeCloseTo(20 * Math.SQRT1_2, 8);
    }
  });
  it('clamps inspection to the actual flight and includes both endpoints in data', () => {
    expect(projectileState(p, -2).t).toBe(0);
    const rows = projectileTable(p, 10);
    expect(rows).toHaveLength(11);
    expect(rows[0].y).toBe(0);
    expect(rows.at(-1)?.y).toBe(0);
    expect(projectileState(p, 10000)).toEqual(rows.at(-1));
    expect(() => projectileTable(p, 0)).toThrow();
    expect(() => projectileState(p, NaN)).toThrow();
  });
  it('handles zero-duration and vertical launches and low gravity without nonfinite values', () => {
    for (const model of [
      { ...p, velocity: 0 },
      { ...p, angle: 0 },
      { ...p, angle: 90, gravity: 0.1 },
    ]) {
      for (const row of projectileTable(model))
        expect(Object.values(row).every(Number.isFinite)).toBe(true);
    }
    expect(projectileState({ ...p, angle: 90 }, 1).x).toBe(0);
  });
});

it('distinguishes a finite x intercept from constant functions', () => {
  const linear = samples[1] as Linear;
  expect(linearIntercept({ ...linear, slope: -2, intercept: 8 })).toBe(4);
  expect(linearIntercept({ ...linear, slope: 0 })).toBeNull();
  expect(linearIntercept({ ...linear, slope: 0, intercept: 0 })).toBeNull();
  expect(linearIntercept({ ...linear, slope: Number.MIN_VALUE, intercept: 1000 })).toBeUndefined();
});
