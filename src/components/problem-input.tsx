'use client';
import { useRef, useState } from 'react';
import { interpretationSchema } from '@/lib/models';
import { MAX_IMAGE_BYTES, MAX_TEXT_LENGTH } from '@/lib/upload';
import {
  errorProblemHandoff,
  problemHandoffQuery,
  publishProblemHandoff,
  readyProblemHandoff,
} from '@/lib/problem-transfer';
import { Button } from './ui/button';
import { Icon } from './icon';
import type { ProviderInfo } from '@/lib/provider';

export function ProblemInput({
  onPending,
  provider,
}: {
  onPending: (pending: boolean) => void;
  provider: ProviderInfo;
}) {
  const [pending, setPending] = useState(false);
  const [takingLonger, setTakingLonger] = useState(false);
  const [message, setMessage] = useState('');
  const [hasImage, setHasImage] = useState(false);
  const [fileName, setFileName] = useState('');
  const [imageRevision, setImageRevision] = useState(0);
  const imageInput = useRef<HTMLInputElement>(null);
  return (
    <form
      className="problem-input"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const image = data.get('image');
        const text = String(data.get('text') || '');
        if (!text.trim() && (!(image instanceof File) || !image.size)) {
          setMessage(
            provider.supportsImages
              ? 'Type a problem or choose an image.'
              : 'Type a problem to continue.',
          );
          return;
        }
        if (
          image instanceof File &&
          (image.name || image.size) &&
          (!image.size ||
            image.size > MAX_IMAGE_BYTES ||
            !['image/png', 'image/jpeg', 'image/webp'].includes(image.type))
        ) {
          setMessage('Use a nonempty PNG, JPEG, or WebP image no larger than 2 MB.');
          return;
        }

        // Open the real problem page during the user gesture so the browser treats
        // this as a new tab. The page waits for the model while the API interprets it.
        const handoffId = crypto.randomUUID();
        const problemTab = window.open(
          `/problem?${problemHandoffQuery}=${encodeURIComponent(handoffId)}`,
          '_blank',
        );
        if (!problemTab) {
          setMessage('Allow pop-ups for this site to open a dedicated problem tab.');
          return;
        }
        const deliver = (handoff: ReturnType<typeof errorProblemHandoff>) => {
          const saved = publishProblemHandoff(handoffId, handoff);
          if (!saved) {
            problemTab.close();
            setMessage(
              'The new tab could not receive your problem. Check browser storage and try again.',
            );
          }
          return saved;
        };

        setPending(true);
        setTakingLonger(false);
        onPending(true);
        setMessage('');
        const slowNoticeTimer = window.setTimeout(() => setTakingLonger(true), 12000);
        try {
          const response = await fetch('/api/interpret', {
            method: 'POST',
            body: data,
            signal: AbortSignal.timeout(65000),
          });
          const body = await response.json();
          if (!response.ok) {
            const message =
              typeof body.error === 'string' ? body.error : 'Interpretation failed. Try again.';
            deliver(errorProblemHandoff(message));
            setMessage(message);
            return;
          }
          const result = interpretationSchema.safeParse(body);
          if (!result.success) {
            const message = 'The server returned an invalid model. Try again or use a sample.';
            deliver(errorProblemHandoff(message));
            setMessage(message);
            return;
          }
          if (result.data.status === 'unsupported') {
            const message = `Unsupported problem: ${result.data.reason}`;
            deliver(errorProblemHandoff(message));
            setMessage(message);
            return;
          }

          if (
            !deliver(
              readyProblemHandoff(
                result.data.problem,
                text,
                image instanceof File && image.size > 0,
              ),
            )
          )
            return;

          form.reset();
          setHasImage(false);
          setFileName('');
        } catch (error) {
          const message =
            error instanceof Error && error.name === 'TimeoutError'
              ? 'The AI model took too long to interpret this problem. Try a shorter question or use a ready-made exercise.'
              : 'The server could not be reached. Try again or use a ready-made exercise.';
          deliver(errorProblemHandoff(message));
          setMessage(message);
        } finally {
          window.clearTimeout(slowNoticeTimer);
          setTakingLonger(false);
          setPending(false);
          onPending(false);
        }
      }}
    >
      <fieldset disabled={pending}>
        <label htmlFor="problem-text">Type your math or physics problem</label>
        <textarea
          id="problem-text"
          name="text"
          rows={4}
          maxLength={MAX_TEXT_LENGTH}
          placeholder="A ball is launched at 20 m/s at 45 degrees from level ground…"
        />
        {provider.supportsImages && (
          <div className="upload-field">
            <Icon name="upload" />
            <label htmlFor="problem-image">
              <strong>{fileName || 'Or upload a problem image'}</strong>
              <span>Photo, screenshot or diagram · PNG, JPG or WebP · Up to 2 MB</span>
            </label>
            <input
              ref={imageInput}
              id="problem-image"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Or upload a problem image"
              onChange={(e) => {
                setHasImage(Boolean(e.target.files?.[0]?.name || e.target.files?.[0]?.size));
                setFileName(e.target.files?.[0]?.name ?? '');
                setImageRevision((value) => value + 1);
                setMessage('');
              }}
              aria-describedby="upload-note"
            />
          </div>
        )}
        {!provider.supportsImages && (
          <p className="note image-unavailable">
            GPT-OSS on {provider.name} reads text only. Type or paste your problem above.
          </p>
        )}
        {hasImage && (
          <button
            className="remove-image"
            type="button"
            onClick={() => {
              if (imageInput.current) imageInput.current.value = '';
              setHasImage(false);
              setFileName('');
              setMessage('');
            }}
          >
            Remove image
          </button>
        )}
        <p id="upload-note" className="note">
          {provider.imageProviderName
            ? `Typed problems are sent to ${provider.name}. Images and accompanying text are sent to ${provider.imageProviderName}.`
            : `${provider.supportsImages ? 'Text and images are' : 'Problem text is'} sent to ${provider.name}.`}{' '}
          Provider retention policies apply. We don’t permanently store them. Remove personal
          information first.
          {provider.supportsImages && ' Still images only, up to 16 megapixels.'}
        </p>
        {hasImage && (
          <label className="consent" key={imageRevision}>
            <input name="imageConsent" value="yes" type="checkbox" required /> I agree to send this
            image and accompanying text to {provider.imageProviderName || provider.name} for
            interpretation.
          </label>
        )}
        <Button className="interpret-button" type="submit" disabled={pending}>
          <Icon name="spark" className={pending ? 'loading-icon' : undefined} />
          {pending ? 'Interpreting problem…' : 'Interpret problem'}
          {!pending && <Icon name="arrow" />}
        </Button>
      </fieldset>
      <p
        role="status"
        className={message ? 'error form-message' : pending ? 'pending-message' : 'empty-status'}
      >
        {message ||
          (pending
            ? takingLonger
              ? 'Still reading your problem. The new tab will be ready as soon as the model finishes.'
              : 'Reading your problem and preparing its dedicated tab…'
            : '')}
      </p>
    </form>
  );
}
