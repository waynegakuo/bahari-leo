import type { Response } from 'express';
import { isRateLimitError, retryAfterSeconds } from './gemini-retry';

export function respondGeminiError(res: Response, err: unknown, fallbackMessage: string): void {
  const message = err instanceof Error ? err.message : fallbackMessage;
  if (isRateLimitError(err)) {
    const retryAfterSec = retryAfterSeconds(err);
    res.set('Retry-After', String(retryAfterSec));
    res.status(429).json({
      error: 'The sea is busy right now — please try again shortly.',
      code: 'RESOURCE_EXHAUSTED',
      retryAfterSec,
    });
    return;
  }
  console.error(fallbackMessage, err);
  res.status(500).json({ error: message });
}
