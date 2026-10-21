import { ProblemWorkbench } from '@/components/problem-workbench';
import { ConceptArt } from '@/components/concept-art';
import { samples } from '@/lib/models';
import { Icon } from '@/components/icon';
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
      <section className="hero" aria-labelledby="welcome-heading">
        <div className="hero-copy">
          <span className="eyebrow">
            <span />
            THE LEARNING LAB
          </span>
          <h1 id="welcome-heading">
            Less memorizing.
            <br />
            More <em>“what if?”</em>
          </h1>
          <p>
            Go beyond the answer. Turn a problem into a model you can play with, question, and
            understand.
          </p>
          <div className="hero-subjects">
            <span>Physics</span>
            <span className="tiny-cross">+</span>
            <span>Mathematics</span>
            <span className="hero-subject-note">A fresh perspective.</span>
          </div>
          <a className="text-link start-link" href="#start-heading">
            Start exploring <Icon name="arrow" />
          </a>
        </div>
        <div className="hero-art">
          <div className="art-topline">
            <span>AN IDEA, IN MOTION</span>
            <span>FIG. 01</span>
          </div>
          <ConceptArt />
          <div className="art-bottomline">
            <span className="art-live-dot" />
            Change one thing. See everything differently.
          </div>
        </div>
      </section>
      <ProblemWorkbench
        key={sample ?? 'new'}
        initialProblem={initialProblem}
        provider={providerInfo()}
      />
    </main>
  );
}
