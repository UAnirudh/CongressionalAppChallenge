'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  consumeProblemHandoff,
  getProblemHandoffSnapshot,
  problemHandoffLoading,
  problemHandoffSchema,
  subscribeToProblemHandoff,
} from '@/lib/problem-transfer';
import type { ProviderInfo } from '@/lib/provider';
import { ProblemWorkbench } from './problem-workbench';
import { Icon } from './icon';

export function DedicatedProblem({
  provider,
  handoffId,
}: {
  provider: ProviderInfo;
  handoffId: string | null;
}) {
  const [timedOutHandoffId, setTimedOutHandoffId] = useState<string | null>(null);
  const transfer = useSyncExternalStore(
    (callback) => subscribeToProblemHandoff(handoffId, callback),
    () => getProblemHandoffSnapshot(handoffId),
    () => problemHandoffLoading,
  );
  const handoff = useMemo(() => {
    if (!transfer || transfer === problemHandoffLoading) return null;
    try {
      return problemHandoffSchema.parse(JSON.parse(transfer));
    } catch {
      return {
        status: 'error' as const,
        message: 'This problem tab could not read the interpretation.',
      };
    }
  }, [transfer]);

  const hasReceivedHandoff = Boolean(transfer && transfer !== problemHandoffLoading);
  const handoffTimedOut = handoffId !== null && timedOutHandoffId === handoffId;
  useEffect(() => {
    if (!handoffId || hasReceivedHandoff) return;
    const timeout = window.setTimeout(() => setTimedOutHandoffId(handoffId), 70000);
    return () => window.clearTimeout(timeout);
  }, [handoffId, hasReceivedHandoff]);

  useEffect(() => {
    if (handoffId && handoff && transfer !== problemHandoffLoading)
      consumeProblemHandoff(handoffId);
  }, [handoffId, handoff, transfer]);

  return (
    <main id="main" className="main-content dedicated-main">
      <Link className="text-link dedicated-back-link" href="/">
        <Icon name="arrow" /> Back to the learning lab
      </Link>
      <header className="dedicated-hero">
        <span className="eyebrow">
          <span /> YOUR PROBLEM, IN FOCUS
        </span>
        <h1>
          One problem. <em>A clearer picture.</em>
        </h1>
        <p>
          Your explanation, graph, measurements, and controls will appear here as soon as your
          problem is interpreted.
        </p>
      </header>
      {handoffId && !hasReceivedHandoff && !handoffTimedOut ? (
        <p className="pending-notice" role="status">
          Preparing your problem, explanation, graph, and controls…
        </p>
      ) : handoff?.status === 'ready' ? (
        <ProblemWorkbench
          key={JSON.stringify(handoff.problem)}
          initialProblem={handoff.problem}
          question={handoff.question}
          provider={provider}
          dedicated
        />
      ) : (
        <section className="panel missing-problem" aria-labelledby="missing-problem-heading">
          <span className="square-icon">
            <Icon name="spark" />
          </span>
          <h2 id="missing-problem-heading">
            {handoff?.status === 'error'
              ? 'We couldn’t interpret that problem.'
              : handoffTimedOut
                ? 'This problem tab timed out.'
                : 'There isn’t a problem in this tab yet.'}
          </h2>
          <p>
            {handoff?.status === 'error'
              ? handoff.message
              : handoffTimedOut
                ? 'The interpretation did not arrive. Return to the learning lab and submit the problem again.'
                : 'Go back to the learning lab and enter a question to start a new exploration.'}
          </p>
          <Link className="button button-primary" href="/">
            Open the learning lab <Icon name="arrow" />
          </Link>
        </section>
      )}
    </main>
  );
}
