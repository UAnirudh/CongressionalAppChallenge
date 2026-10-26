import { z } from 'zod';
import { problemSchema, type Problem } from './models';

export const problemHandoffQuery = 'handoff';
export const problemHandoffLoading = '__conceptlens_problem_handoff_loading__';

export const problemHandoffSchema = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.literal('ready'),
    problem: problemSchema,
    question: z.string().max(4000).optional(),
    requiresReview: z.boolean().optional(),
    imagePreview: z
      .string()
      .max(500_000)
      .regex(/^data:image\/jpeg;base64,/)
      .optional(),
  }),
  z.strictObject({ status: z.literal('error'), message: z.string().min(1).max(500) }),
]);

export type ProblemHandoff = z.infer<typeof problemHandoffSchema>;

const storagePrefix = 'conceptlens:problem-handoff:';
const snapshots = new Map<string, string | null>();

function storageKey(id: string) {
  return `${storagePrefix}${id}`;
}

export function publishProblemHandoff(id: string, handoff: ProblemHandoff) {
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(handoff));
    return true;
  } catch {
    return false;
  }
}

export function getProblemHandoffSnapshot(id: string | null) {
  if (!id) return null;
  if (snapshots.has(id)) return snapshots.get(id) ?? null;
  try {
    const value = localStorage.getItem(storageKey(id));
    snapshots.set(id, value);
    return value;
  } catch {
    snapshots.set(id, null);
    return null;
  }
}

export function subscribeToProblemHandoff(id: string | null, callback: () => void) {
  if (!id) return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey(id)) return;
    snapshots.delete(id);
    callback();
  };
  window.addEventListener('storage', onStorage);
  // Re-read after subscribing so a write between hydration and subscription is not missed.
  snapshots.delete(id);
  callback();
  return () => window.removeEventListener('storage', onStorage);
}

export function consumeProblemHandoff(id: string) {
  try {
    localStorage.removeItem(storageKey(id));
  } catch {
    // The active tab already has the model in memory if storage cannot be cleared.
  }
}

export function readyProblemHandoff(
  problem: Problem,
  question?: string,
  requiresReview = false,
  imagePreview?: string,
): ProblemHandoff {
  const trimmedQuestion = question?.trim().slice(0, 4000);
  return {
    status: 'ready',
    problem,
    ...(requiresReview ? { requiresReview: true } : {}),
    ...(trimmedQuestion ? { question: trimmedQuestion } : {}),
    ...(requiresReview && imagePreview ? { imagePreview } : {}),
  };
}

export function errorProblemHandoff(message: string): ProblemHandoff {
  return {
    status: 'error',
    message: message.slice(0, 500) || 'The problem could not be interpreted.',
  };
}
