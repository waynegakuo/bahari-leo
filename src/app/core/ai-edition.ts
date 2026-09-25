import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ComicEdition } from './sea-story-brief';
import { SeaStory } from './models';
import { SeaStoryCopy } from './story-copy';

export interface CoverArtRequest {
  placeId: string;
  placeName: string;
  county: string;
  story: Pick<SeaStory, 'mood' | 'headline' | 'blurb'>;
}

export interface CoverArtResponse {
  imageUrl?: string;
  status: 'ready' | 'failed';
}

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

  async fetchCoverArt(input: CoverArtRequest, abortSignal?: AbortSignal): Promise<CoverArtResponse> {
    const base = environment.functionsBaseUrl;
    if (!base) {
      throw new Error('AI edition is not configured');
    }
    const response = await fetch(`${base}/generateCoverArt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId: input.placeId,
        placeName: input.placeName,
        county: input.county,
        mood: input.story.mood,
        headline: input.story.headline,
        blurb: input.story.blurb,
      }),
      signal: abortSignal,
    });
    if (!response.ok) {
      throw new Error(`Cover art request failed (${response.status})`);
    }
    return (await response.json()) as CoverArtResponse;
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
