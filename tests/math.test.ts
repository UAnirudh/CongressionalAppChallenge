import { describe, expect, it } from 'vitest';
import { checkPrediction, linearValue, prediction, projectile } from '../src/lib/math';
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
