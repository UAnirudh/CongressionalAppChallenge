'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { renderToString } from 'katex';
import type { Problem } from '@/lib/models';
import type { ProviderInfo } from '@/lib/provider';
import { Icon } from './icon';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const mathDelimiter = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+?\$)/g;

function ChatMessageBody({ content }: { content: string }) {
  const parts = content.split(mathDelimiter).filter(Boolean);

  return (
    <div className="chat-message-body">
      {parts.map((part, index) => {
        const display = part.startsWith('$$') || part.startsWith('\\[');
        const inline = !display && (part.startsWith('\\(') || part.startsWith('$'));
        if (!display && !inline) return <span key={index}>{part}</span>;

        const expression = display
          ? part.slice(2, -2)
          : part.startsWith('\\(')
            ? part.slice(2, -2)
            : part.slice(1, -1);
        const markup = renderToString(expression, {
          displayMode: display,
          throwOnError: false,
          trust: false,
          strict: 'ignore',
        });
        const Wrapper = display ? 'div' : 'span';
        return (
          <Wrapper
            key={index}
            className={display ? 'chat-math-display' : 'chat-math-inline'}
            dangerouslySetInnerHTML={{ __html: markup }}
          />
        );
      })}
    </div>
  );
}

export function ProblemChat({
  problem,
  originalQuestion,
  provider,
  prefillQuestion,
}: {
  problem: Problem;
  originalQuestion?: string;
  provider: ProviderInfo;
  prefillQuestion?: { text: string; revision: number } | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [editedPrefillRevision, setEditedPrefillRevision] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const form = useRef<HTMLFormElement>(null);
  const endOfTranscript = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfTranscript.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, pending]);

  const inputValue =
    prefillQuestion && editedPrefillRevision !== prefillQuestion.revision
      ? prefillQuestion.text
      : input;

  async function ask(rawQuestion: string) {
    const content = rawQuestion.trim();
    if (!content || pending) return;
    const userMessage: ChatMessage = { role: 'user', content };
    const previousMessages = messages.slice(-8);
    const outgoing = [...previousMessages, userMessage];
    setMessages(outgoing);
    setInput('');
    if (prefillQuestion) setEditedPrefillRevision(prefillQuestion.revision);
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          originalQuestion: originalQuestion ?? '',
          messages: outgoing,
        }),
        signal: AbortSignal.timeout(55000),
      });
      let result: { answer?: unknown; error?: unknown };
      try {
        result = (await response.json()) as { answer?: unknown; error?: unknown };
      } catch {
        throw new Error('The AI tutor returned an unreadable response. Try again shortly.');
      }
      if (!response.ok)
        throw new Error(
          typeof result.error === 'string'
            ? result.error
            : 'The AI tutor could not answer. Try again.',
        );
      if (typeof result.answer !== 'string')
        throw new Error('The AI tutor returned an unreadable answer. Try again.');
      setMessages([...outgoing, { role: 'assistant', content: result.answer }]);
    } catch (cause) {
      setMessages(previousMessages);
      setInput(content);
      setError(
        cause instanceof Error
          ? cause.message
          : 'The AI tutor could not be reached. Try again shortly.',
      );
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(inputValue);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.current?.requestSubmit();
    }
  }

  const suggestions =
    problem.type === 'projectile_motion'
      ? ['Why does it reach its highest point?', 'What if gravity were stronger?']
      : ['How does the slope change the line?', 'What happens when x = 3?'];

  return (
    <section className="problem-chat" aria-label="Ask a question about this problem">
      <header className="problem-chat-header">
        <span className="problem-chat-mark">
          <Icon name="spark" />
        </span>
        <div>
          <h2>Ask about this problem</h2>
          <p>Your tutor can explain the math using the values in your current model.</p>
        </div>
      </header>

      <div className="chat-transcript" role="log" aria-label="Conversation" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <strong>What are you curious about?</strong>
            <p>Ask a follow-up or start with one of these:</p>
            <div className="chat-suggestions">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="chat-suggestion"
                  disabled={pending}
                  onClick={() => void ask(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <article
              key={`${index}-${message.role}`}
              className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-tutor'}`}
            >
              <span>{message.role === 'user' ? 'You' : 'ConceptLens tutor'}</span>
              <ChatMessageBody content={message.content} />
            </article>
          ))
        )}
        {pending && (
          <p className="chat-pending" role="status">
            Thinking through this problem…
          </p>
        )}
        {error && (
          <p className="chat-error" role="alert">
            {error}
          </p>
        )}
        <div ref={endOfTranscript} />
      </div>

      <form className="chat-form" ref={form} onSubmit={handleSubmit}>
        <label htmlFor="problem-chat-input">Your question</label>
        <div className="chat-compose">
          <textarea
            id="problem-chat-input"
            value={inputValue}
            rows={2}
            maxLength={1000}
            placeholder={
              problem.type === 'projectile_motion'
                ? 'Ask what changes as the object moves…'
                : 'Ask how changing the slope affects the line…'
            }
            disabled={pending}
            onChange={(event) => {
              setInput(event.target.value);
              if (prefillQuestion) setEditedPrefillRevision(prefillQuestion.revision);
            }}
            onKeyDown={handleInputKeyDown}
          />
          <button
            className="button button-primary chat-send"
            type="submit"
            disabled={!inputValue.trim() || pending}
          >
            {pending ? 'Thinking…' : 'Ask'}
            {!pending && <Icon name="arrow" />}
          </button>
        </div>
        <div className="chat-footer">
          <span>Enter to send · Shift + Enter for a new line</span>
          <span>
            Your question, problem, and model values are sent to {provider.name}; provider retention
            policies apply. This chat isn’t saved by ConceptLens.
          </span>
        </div>
      </form>
    </section>
  );
}
