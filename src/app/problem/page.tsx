import { DedicatedProblem } from '@/components/dedicated-problem';
import { providerInfo } from '@/lib/provider';
import { z } from 'zod';

export default async function ProblemPage({
  searchParams,
}: {
  searchParams: Promise<{ handoff?: string | string[] }>;
}) {
  const { handoff } = await searchParams;
  const parsedId = typeof handoff === 'string' ? z.uuid().safeParse(handoff) : null;
  const handoffId = parsedId?.success ? parsedId.data : null;
  return <DedicatedProblem handoffId={handoffId} provider={providerInfo()} />;
}
