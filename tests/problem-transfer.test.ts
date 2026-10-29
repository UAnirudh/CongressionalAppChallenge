import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  consumeProblemHandoff,
  errorProblemHandoff,
  getProblemHandoffSnapshot,
  problemHandoffTtlMs,
  publishProblemHandoff,
} from '../src/lib/problem-transfer';

const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
  removeItem: (key: string) => values.delete(key),
};

beforeEach(() => {
  values.clear();
  vi.stubGlobal('localStorage', storage);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('publishes a handoff that can be read once and consumed', () => {
  const handoff = errorProblemHandoff('Try a clearer photo.');
  expect(publishProblemHandoff('one-time-id', handoff)).toBe(true);
  expect(JSON.parse(getProblemHandoffSnapshot('one-time-id')!)).toEqual(handoff);

  consumeProblemHandoff('one-time-id');
  expect(values.size).toBe(0);
});

it('removes an unread handoff after five minutes', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-28T12:00:00Z'));
  publishProblemHandoff('unread-id', errorProblemHandoff('Try again.'));

  vi.advanceTimersByTime(problemHandoffTtlMs);
  expect(values.size).toBe(0);
  expect(getProblemHandoffSnapshot('unread-id')).toBeNull();
});

it('discards a handoff that is already expired when a tab reads it', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-28T12:00:00Z'));
  publishProblemHandoff('expired-id', errorProblemHandoff('Try again.'));
  vi.setSystemTime(new Date(Date.now() + problemHandoffTtlMs));

  expect(getProblemHandoffSnapshot('expired-id')).toBeNull();
  expect(values.size).toBe(0);
});
