const RATE_LIMIT_PATTERN = /429|RESOURCE_EXHAUSTED|Too Many Requests|rate limit|spend-based/i;

export function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return RATE_LIMIT_PATTERN.test(message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Truncated exponential backoff — see Gemini 429 guidance. */
export async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  label: string,
  options?: { maxAttempts?: number; baseMs?: number; maxMs?: number },
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 4;
  const baseMs = options?.baseMs ?? 1_500;
  const maxMs = options?.maxMs ?? 32_000;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (!isRateLimitError(err) || attempt >= maxAttempts) {
        throw err;
      }
      const jitter = Math.random() * 750;
      const delay = Math.min(maxMs, baseMs * 2 ** (attempt - 1)) + jitter;
      console.warn(`${label}: rate limited, retry ${attempt}/${maxAttempts - 1} in ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }
}

export function retryAfterSeconds(err: unknown): number {
  if (!isRateLimitError(err)) {
    return 0;
  }
  return 30;
}
