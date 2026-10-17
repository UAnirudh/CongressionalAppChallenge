import { expect, it } from 'vitest';
import { interpretationSchema, problemSchema, samples } from '../src/lib/models';
it('accepts the two sample contracts', () =>
  samples.forEach((p) => expect(problemSchema.safeParse(p).success).toBe(true)));
it('rejects unknown topics, units, code fields, and nonfinite values', () => {
  for (const patch of [
    { type: 'calculus' },
    { velocityUnit: 'mph' },
    { code: 'alert(1)' },
    { velocity: Infinity },
    { angle: 91 },
  ]) {
    expect(problemSchema.safeParse({ ...samples[0], ...patch }).success).toBe(false);
  }
});
it('keeps unsupported responses separate from mathematical models', () => {
  expect(
    interpretationSchema.safeParse({ status: 'unsupported', reason: 'Calculus is not supported.' })
      .success,
  ).toBe(true);
  expect(
    interpretationSchema.safeParse({ status: 'supported', problem: { type: 'calculus' } }).success,
  ).toBe(false);
});
