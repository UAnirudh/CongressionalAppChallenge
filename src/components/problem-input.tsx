'use client';
import { useState } from 'react';
import { interpretationSchema, type Problem } from '@/lib/models';
import { MAX_IMAGE_BYTES, MAX_TEXT_LENGTH } from '@/lib/upload';
import { Button } from './ui/button';

export function ProblemInput({
  onModel,
  onPending,
}: {
  onModel: (problem: Problem) => void;
  onPending: (pending: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [hasImage, setHasImage] = useState(false);
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
            signal: AbortSignal.timeout(35000),
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
          rows={3}
          maxLength={MAX_TEXT_LENGTH}
          placeholder="A ball is launched at 20 m/s at 45 degrees from level ground…"
        />
        <label htmlFor="problem-image">Or upload a problem image</label>
        <input
          id="problem-image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            setHasImage(Boolean(e.target.files?.[0]?.size));
            setMessage('');
          }}
          aria-describedby="upload-note"
        />
        <p id="upload-note" className="note">
          Still PNG, JPEG, or WebP, up to 2 MB and 16 megapixels. Text and selected images are sent
          to OpenAI for interpretation. This app does not permanently store them. Provider retention
          policies apply. Remove names and other personal information first.
        </p>
        {hasImage && (
          <label className="consent">
            <input name="imageConsent" value="yes" type="checkbox" required /> I agree to send this
            image to the AI provider for interpretation.
          </label>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? 'Reading your problem…' : 'Interpret problem'}
        </Button>
      </fieldset>
      <p role="status" className={message ? 'error mt-4' : ''}>
        {message}
      </p>
    </form>
  );
}
