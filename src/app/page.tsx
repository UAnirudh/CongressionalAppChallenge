import { ProblemWorkbench } from '@/components/problem-workbench';
import { samples } from '@/lib/models';
import { providerInfo } from '@/lib/provider';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sample?: string }>;
}) {
  const { sample } = await searchParams;
  const initialProblem =
    sample === 'projectile' ? samples[0] : sample === 'linear' ? samples[1] : null;
  return (
    <main id="main" className="main-content">
      <div className="lab-intro">
        <div>
          <span className="eyebrow">The learning lab</span>
          <h1 id="welcome-heading">Make sense of the math.</h1>
          <p>Build a model. Change a variable. See why it works.</p>
        </div>
        <span className="lab-availability">
          <span className="art-live-dot" />2 interactive models · 42 guided exercises
        </span>
      </div>
      <ProblemWorkbench
        key={sample ?? 'new'}
        initialProblem={initialProblem}
        provider={providerInfo()}
      />
    </main>
  );
}
