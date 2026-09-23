import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { ensureGenkitTelemetry } from '../telemetry';

type GenkitRuntime = ReturnType<typeof genkit>;

let runtime: GenkitRuntime | null = null;

/** Shared Genkit runtime — agents pick their own model per call. */
export async function getRuntime(): Promise<GenkitRuntime> {
  await ensureGenkitTelemetry();
  if (!runtime) {
    runtime = genkit({
      plugins: [googleAI()],
    });
  }
  return runtime;
}
