import {
  InterpretationError,
  interpret,
  readBoundedBody,
  validateImage,
} from '@/lib/interpretation';
import { MAX_TEXT_LENGTH } from '@/lib/upload';

export const runtime = 'nodejs';
export const maxDuration = 30;
const headers = { 'Cache-Control': 'no-store' };
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data;'))
      throw new InterpretationError('Submit text or an image using the problem form.', 415);
    const bytes = await readBoundedBody(request);
    let form: FormData;
    try {
      form = await new Response(bytes, { headers: { 'Content-Type': contentType } }).formData();
    } catch {
      throw new InterpretationError('The upload could not be read. Choose the image again.', 400);
    }
    const text = form.get('text');
    if (typeof text !== 'string' || text.length > MAX_TEXT_LENGTH)
      throw new InterpretationError('Use no more than 4,000 characters.', 400);
    const file = form.get('image');
    if (form.getAll('image').length > 1 || form.getAll('text').length !== 1)
      throw new InterpretationError('Submit one problem and at most one image.', 400);
    let image: { mime: string; bytes: Uint8Array } | undefined;
    if (file instanceof File && file.size > 0) {
      if (form.get('imageConsent') !== 'yes')
        throw new InterpretationError('Confirm image processing before uploading.', 400);
      image = { mime: file.type, bytes: new Uint8Array(await file.arrayBuffer()) };
      await validateImage(image.bytes, image.mime);
    } else if (file !== null && !(file instanceof File))
      throw new InterpretationError('Choose a valid image file.', 400);
    if (!text.trim() && !image)
      throw new InterpretationError('Type a problem or choose an image.', 400);
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
      throw new InterpretationError(
        'AI interpretation is not configured on this server. You can still explore both sample exercises.',
        503,
      );
    const result = await interpret(
      { text: text.trim(), image },
      { key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL },
    );
    return Response.json(result, { headers });
  } catch (error) {
    const known = error instanceof InterpretationError;
    return Response.json(
      {
        error: known
          ? error.message
          : 'The problem could not be processed. Try again or use a sample.',
      },
      { status: known ? error.status : 500, headers },
    );
  }
}
