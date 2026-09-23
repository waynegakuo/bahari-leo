import { Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { ComicEdition } from './sea-story-brief';

@Service()
export class AiEdition {
  configured(): boolean {
    return Boolean(environment.functionsBaseUrl);
  }

  async fetchEdition(placeId: string, abortSignal?: AbortSignal): Promise<ComicEdition> {
    const base = environment.functionsBaseUrl;
    if (!base) {
      throw new Error('AI edition is not configured');
    }
    const response = await fetch(`${base}/generateEdition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId }),
      signal: abortSignal,
    });
    if (!response.ok) {
      throw new Error(`Edition request failed (${response.status})`);
    }
    return (await response.json()) as ComicEdition;
  }
}
