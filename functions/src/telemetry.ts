import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

let ready: Promise<void> | null = null;

/** Export Genkit traces/metrics/logs to Firebase Genkit Monitoring (Cloud Trace, Monitoring, Logging). */
export function ensureGenkitTelemetry(): Promise<void> {
  ready ??= enableFirebaseTelemetry();
  return ready;
}
