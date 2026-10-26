import Link from 'next/link';
import { Icon } from '@/components/icon';
import styles from './guide.module.css';

export const metadata = {
  title: 'How it works | ConceptLens',
  description:
    'Learn how to turn a question into an interactive model, explore graphs and projectile playback, and work through guided physics and math exercises.',
};

const practiceSteps = [
  {
    title: 'Find your topic',
    text: 'Choose Physics or Math, then a topic. Open a problem card to practice in the current tab.',
  },
  {
    title: 'Connect the graph to the idea',
    text: 'Read “What to notice” alongside the graph. Use the zoom controls to take a closer look at the relationship before solving.',
  },
  {
    title: 'Try, check, and build on it',
    text: 'Choose “Start practice” and enter a numerical answer. A missed answer unlocks the next hint, or you can ask for one yourself. The worked solution appears when you solve it, or you can reveal it after all the hints.',
  },
];

const questions = [
  {
    title: 'Which problems can I enter in the Learning Lab?',
    text: 'The lab currently interprets projectile motion and unitless linear functions of the form y = mx + b. Projectile models assume constant gravity, no air resistance, and the same launch and landing height. The Exercise Library also includes motion and speed, forces and energy, quadratics, and exponential functions as ready-made exercises.',
  },
  {
    title: 'Why is my new problem tab empty?',
    text: 'Start from the Learning Lab and choose “Interpret problem.” If your browser allows a new tab, your question opens there; if a pop-up is blocked or closed, the lab continues in the current tab. Opening the problem page directly does not load a previous question.',
  },
  {
    title: 'What if the AI cannot interpret my question?',
    text: 'Check that your problem matches a supported topic and includes the needed values and units. If the AI service is unavailable, try the Exercise Library: its explanations, graphs, hints, and answer checks work without an AI connection.',
  },
  {
    title: 'How precise does my answer need to be?',
    text: 'Enter a number in the unit shown beside the answer box. Answers are accepted within 1% of the calculated value or 0.01, whichever is larger. In the lab, changing a variable clears prediction feedback so you can try again.',
  },
  {
    title: 'Will my work be saved?',
    text: 'Your exploration, tutor conversation, and practice progress are temporary. Reloading or leaving a problem can reset them. In the Learning Lab, you can export graph data as a CSV file if you want to keep the numbers.',
  },
];

export default function Guide() {
  return (
    <main id="main" className={`main-content ${styles.page}`}>
      <header className={styles.intro}>
        <span className="eyebrow">How it works</span>
        <h1>See the idea behind the answer.</h1>
        <p>
          Connect the question, the equation, and the graph. Bring a problem to the Learning Lab, or
          build your confidence with guided practice.
        </p>
        <nav className={styles.jumpLinks} aria-label="On this page">
          <a href="#learning-lab">
            Using the lab <span aria-hidden="true">↓</span>
          </a>
          <a href="#guided-practice">
            Guided practice <span aria-hidden="true">↓</span>
          </a>
          <a href="#common-questions">
            Common questions <span aria-hidden="true">↓</span>
          </a>
        </nav>
      </header>

      <div className={styles.paths}>
        <article className={`${styles.path} ${styles.labPath}`}>
          <div className={styles.pathTop}>
            <Icon name="lab" />
            <span>Your own question</span>
          </div>
          <h2>Learning Lab</h2>
          <p>Turn a problem into a model you can adjust, play back, and ask questions about.</p>
          <Link href="/" className={styles.pathLink}>
            Open the lab <Icon name="arrow" />
          </Link>
        </article>
        <article className={`${styles.path} ${styles.practicePath}`}>
          <div className={styles.pathTop}>
            <Icon name="library" />
            <span>A little practice</span>
          </div>
          <h2>Exercise Library</h2>
          <p>Pick a topic and work toward the answer with a graph, an explanation, and hints.</p>
          <Link href="/samples" className={styles.pathLink}>
            Find an exercise <Icon name="arrow" />
          </Link>
        </article>
      </div>

      <section id="learning-lab" className={styles.section} aria-labelledby="lab-heading">
        <div className={styles.sectionHeading}>
          <span className="eyebrow">01 / Learning Lab</span>
          <h2 id="lab-heading">A question becomes something you can explore.</h2>
          <p>
            A model is your problem expressed as equations, values, and assumptions. AI helps read
            the question; the equations calculate what you see on the graph.
          </p>
        </div>
        <div className={styles.labGrid}>
          <ol className={styles.steps}>
            <li>
              <div>
                <h3>Give the lab the full problem.</h3>
                <p>
                  Include the values, units, and what you want to find. For a projectile, give the
                  starting speed and launch angle. For a line, include its equation.
                </p>
                <blockquote className={styles.example}>
                  <span>For example</span>A ball is launched at 20 m/s at 35°. Ignore air
                  resistance. How far does it travel before returning to its launch height?
                </blockquote>
                <p>
                  Choose <strong>Interpret problem</strong>. Your problem opens in a dedicated
                  workspace. If your browser blocks new tabs, it continues in the current tab.
                </p>
              </div>
            </li>
            <li>
              <div>
                <h3>Check the values and assumptions.</h3>
                <p>
                  Compare the model with your original question. AI can misread a detail. Use{' '}
                  <strong>Edit model &amp; assumptions</strong> to correct it; image-based problems
                  ask you to review the model first.
                </p>
              </div>
            </li>
            <li>
              <div>
                <h3>Change one thing. Notice what happens.</h3>
                <p>
                  Move a slider and watch the graph respond. Change a launch angle to compare paths,
                  or change a line’s slope to see it become steeper. Use{' '}
                  <strong>Make a prediction</strong> to try an answer before revealing the results.
                </p>
              </div>
            </li>
          </ol>

          <aside className={styles.workspace} aria-labelledby="workspace-heading">
            <span className="eyebrow">Inside your problem tab</span>
            <h3 id="workspace-heading">One section at a time.</h3>
            <dl className={styles.tools}>
              <div>
                <dt>
                  <Icon name="guide" /> Explanation
                </dt>
                <dd>
                  Follow the equations and worked steps to understand why the answer makes sense.
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="sliders" /> Projectile motion / Graph &amp; controls
                </dt>
                <dd>
                  Adjust values, inspect coordinates, compare a saved model, or view the data.
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="target" /> Guided exploration
                </dt>
                <dd>
                  Work through four short steps with hints and worked calculations, then predict a
                  change and apply it to compare the graphs.
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="spark" /> Ask the tutor
                </dt>
                <dd>
                  Ask a follow-up about this problem, a confusing step, or a moment in the motion.
                </dd>
              </div>
            </dl>
            <div className={styles.playbackTip}>
              <strong>Want to slow the motion down?</strong>
              <p>
                Use Play and Pause, or enter x and y under <strong>Pause at a coordinate</strong>{' '}
                and choose <strong>Set pause point</strong>. The point must lie on the current path.
                Playback will stop there so you can inspect that moment.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section id="guided-practice" className={styles.section} aria-labelledby="practice-heading">
        <div className={styles.sectionHeading}>
          <span className="eyebrow">02 / Exercise Library</span>
          <h2 id="practice-heading">Work toward the solution, one hint at a time.</h2>
          <p>
            Ready-made physics and math exercises give you a focused place to practice. Each
            includes a graph and an explanation, and works without an AI connection.
          </p>
        </div>
        <ol className={styles.practiceSteps}>
          {practiceSteps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepNumber} aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <Link href="/samples" className={styles.inlineLink}>
          Choose something to practice <Icon name="arrow" />
        </Link>
      </section>

      <section id="common-questions" className={styles.section} aria-labelledby="questions-heading">
        <div className={styles.sectionHeading}>
          <span className="eyebrow">A few useful details</span>
          <h2 id="questions-heading">Before you get started.</h2>
        </div>
        <div className={styles.questions}>
          {questions.map((question) => (
            <details key={question.title} className={styles.question}>
              <summary>
                {question.title}
                <span className={styles.questionToggle} aria-hidden="true" />
              </summary>
              <p>{question.text}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="your-data" className={styles.privacy} aria-labelledby="privacy-heading">
        <div className={styles.privacyHeading}>
          <Icon name="lock" />
          <div>
            <span className="eyebrow">Your data &amp; privacy</span>
            <h2 id="privacy-heading">Know what you’re sharing.</h2>
          </div>
        </div>
        <div className={styles.privacyColumns}>
          <div>
            <h3>Exploring and practicing</h3>
            <p>
              Graph calculations, sliders, and library answer checks don’t send your work to an AI
              provider. The library needs no account. Browser storage briefly passes your question
              and a reduced image preview to its review workspace; it is removed after the workspace
              reads it and is not a saved history.
            </p>
          </div>
          <div>
            <h3>Interpreting and asking the tutor</h3>
            <p>
              Interpreting sends your text and any consented image to the provider named on the
              form. The tutor sends your question, model values, and chat history to the configured
              text provider. Provider retention policies apply. Remove personal details from
              uploads; each new image requires your consent.
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.ready}>
        <div>
          <h2>Start with something you’re curious about.</h2>
          <p>You can adjust the model, try an idea, and see what changes.</p>
        </div>
        <Link className="button button-primary" href="/">
          Go to the Learning Lab <Icon name="arrow" />
        </Link>
      </footer>
    </main>
  );
}
