import Link from 'next/link';
import { Icon, type IconName } from '@/components/icon';

export const metadata = {
  title: 'How it works | ConceptLens',
  description:
    'A guide to exploring, reviewing models, making predictions, and understanding your data in ConceptLens.',
};

const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'spark',
    title: 'Bring a little curiosity',
    text: 'Type a projectile motion or unitless linear function problem, upload a clear image, or choose a ready-to-use exercise. Samples work without an AI connection.',
  },
  {
    icon: 'sliders',
    title: 'Make the model yours',
    text: 'Review every value and assumption. The interpretation can make mistakes, so compare it with your original problem and edit anything that needs correcting.',
  },
  {
    icon: 'target',
    title: 'Explore, predict, understand',
    text: 'Move a slider or change a value to see the graph respond. Inspect points, switch graph views, save a comparison, or export data as CSV. Choose “Make a prediction” to hide the results, try an answer, then check your reasoning against the model.',
  },
];

export default function Guide() {
  return (
    <main id="main" className="main-content guide-page">
      <div className="page-intro">
        <span className="eyebrow">A FIELD GUIDE TO CURIOSITY</span>
        <h1>
          Understanding starts
          <br />
          <em>with exploring.</em>
        </h1>
        <p>You don’t need to know the answer to get started. Just bring a question.</p>
      </div>
      <div className="guide-steps">
        {steps.map((step, i) => (
          <section className="guide-step" key={step.title}>
            <span className="guide-number">0{i + 1}</span>
            <Icon name={step.icon} />
            <div>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </div>
          </section>
        ))}
      </div>
      <section className="guide-details">
        <div>
          <span className="eyebrow">KNOW YOUR MODEL</span>
          <h2>A few useful boundaries</h2>
        </div>
        <div>
          <h3>Projectile motion</h3>
          <p>
            The launch and landing are at the same height. Gravity stays constant, and air
            resistance is ignored. Both graph axes use the same scale in meters.
          </p>
          <h3>Linear functions</h3>
          <p>
            Explore y = mx + b with unitless axes. Choose your x window, inspect any coordinate, and
            compare a saved function. The y axis fits your values.
          </p>
          <h3>Checking predictions</h3>
          <p>
            Answers within 1% or 0.01 of the calculated value are accepted. Changing a variable
            clears the feedback so you can try again.
          </p>
        </div>
      </section>
      <section id="your-data" className="guide-details privacy-section">
        <div>
          <span className="eyebrow">
            <Icon name="lock" />
            YOUR DATA & PRIVACY
          </span>
          <h2>
            Your question.
            <br />
            Your choice.
          </h2>
        </div>
        <div>
          <p>
            Sample exercises and mathematical calculations run in your browser. You can use them
            without an account or sending a problem to an AI provider.
          </p>
          <p>
            When you choose “Interpret problem,” your problem is sent to the provider named on the
            input form: NVIDIA or OpenAI. This app does not permanently store it; provider retention
            policies apply. GPT-OSS on NVIDIA accepts text only. Image-capable OpenAI models require
            your explicit agreement before image submission.
          </p>
          <p>
            Remove names, school details, and other personal information before uploading. Images
            must be still PNG, JPEG, or WebP files, up to 2 MB and 16 megapixels.
          </p>
          <p>Your current model is temporary and resets when you reload or leave the lab.</p>
        </div>
      </section>
      <Link className="button button-primary" href="/">
        Let’s explore <Icon name="arrow" />
      </Link>
    </main>
  );
}
