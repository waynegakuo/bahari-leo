import { withGeminiRetry } from './gemini-retry';

/** Pause between image jobs to smooth spend-rate spikes. */
export const IMAGE_JOB_GAP_MS = 2_500;

let chain: Promise<void> = Promise.resolve();
let lastFinishedAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Serialise image generation — one Gemini image call at a time per function instance. */
export async function runImageJob<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const sinceLast = Date.now() - lastFinishedAt;
    if (sinceLast < IMAGE_JOB_GAP_MS) {
      await sleep(IMAGE_JOB_GAP_MS - sinceLast);
    }
    try {
      return await withGeminiRetry(fn, label, { maxAttempts: 3, baseMs: 2_000, maxMs: 45_000 });
    } finally {
      lastFinishedAt = Date.now();
    }
  });

  chain = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
}
