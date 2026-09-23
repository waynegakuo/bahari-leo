import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ComicEdition } from './sea-story-brief';
import { SeaStoryCopy } from './story-copy';

@Injectable({ providedIn: 'root' })
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

  async fetchStoryCopies(placeIds: string[], abortSignal?: AbortSignal): Promise<Record<string, SeaStoryCopy>> {
    const base = environment.functionsBaseUrl;
    if (!base) {
      throw new Error('AI edition is not configured');
    }
    const response = await fetch(`${base}/generateStoryCopies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeIds }),
      signal: abortSignal,
    });
    if (!response.ok) {
      throw new Error(`Story copy request failed (${response.status})`);
    }
    const body = (await response.json()) as { stories: Record<string, SeaStoryCopy> };
    return body.stories ?? {};
  }
}
