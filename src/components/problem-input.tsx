'use client';
import { useRef, useState } from 'react';
import { interpretationSchema, type Problem } from '@/lib/models';
import { MAX_IMAGE_BYTES, MAX_TEXT_LENGTH } from '@/lib/upload';
import { Button } from './ui/button';
import { Icon } from './icon';
import type { ProviderInfo } from '@/lib/provider';

export function ProblemInput({
  onModel,
  onPending,
  provider,
}: {
  onModel: (problem: Problem) => void;
  onPending: (pending: boolean) => void;
  provider: ProviderInfo;
}) {
  const [pending, setPending] = useState(false);
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
          setMessage('Type a problem or choose an image.');
          return;
        }
        if (
          image instanceof File &&
          image.size &&
          (image.size > MAX_IMAGE_BYTES ||
            !['image/png', 'image/jpeg', 'image/webp'].includes(image.type))
        ) {
          setMessage('Use a PNG, JPEG, or WebP image no larger than 2 MB.');
          return;
        }
        setPending(true);
        onPending(true);
        setMessage('');
        try {
          const response = await fetch('/api/interpret', {
            method: 'POST',
            body: data,
            signal: AbortSignal.timeout(65000),
          });
          const body = await response.json();
          if (!response.ok) {
            setMessage(
              typeof body.error === 'string' ? body.error : 'Interpretation failed. Try again.',
            );
            return;
          }
          const result = interpretationSchema.safeParse(body);
          if (!result.success) {
            setMessage('The server returned an invalid model. Try again or use a sample.');
            return;
          }
          if (result.data.status === 'unsupported') {
            setMessage(`Unsupported problem: ${result.data.reason}`);
            return;
          }
          onModel(result.data.problem);
          form.reset();
          setHasImage(false);
          setFileName('');
        } catch {
          setMessage('The server could not be reached in time. Try again or use a sample.');
        } finally {
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
        <div className="upload-field">
          <Icon name="upload" />
          <label htmlFor="problem-image">
            <strong>
              {provider.supportsImages
                ? fileName || 'Or upload a problem image'
                : 'Image input unavailable with GPT-OSS'}
            </strong>
            <span>
              {provider.supportsImages
                ? 'PNG, JPG or WebP · Up to 2 MB'
                : 'Use a typed problem or a sample exercise'}
            </span>
          </label>
          <input
            ref={imageInput}
            disabled={!provider.supportsImages}
            id="problem-image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label="Or upload a problem image"
            onChange={(e) => {
              setHasImage(Boolean(e.target.files?.[0]?.size));
              setFileName(e.target.files?.[0]?.name ?? '');
              setImageRevision((value) => value + 1);
              setMessage('');
            }}
            aria-describedby="upload-note"
          />
        </div>
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
          {provider.supportsImages ? 'Text and images are' : 'Problem text is'} sent to{' '}
          {provider.name}, subject to provider retention policies. We don’t permanently store them.
          Remove personal information first. Still images only, up to 16 megapixels.
        </p>
        {hasImage && (
          <label className="consent" key={imageRevision}>
            <input name="imageConsent" value="yes" type="checkbox" required /> I agree to send this
            image to the AI provider for interpretation.
          </label>
        )}
        <Button className="interpret-button" type="submit" disabled={pending}>
          <Icon name="spark" className={pending ? 'loading-icon' : undefined} />
          {pending ? 'Reading your problem…' : 'Interpret problem'}
          {!pending && <Icon name="arrow" />}
        </Button>
      </fieldset>
      <p
        role="status"
        className={message ? 'error form-message' : pending ? 'pending-message' : 'empty-status'}
      >
        {message || (pending ? 'Finding the variables and assumptions in your question…' : '')}
      </p>
    </form>
  );
}
