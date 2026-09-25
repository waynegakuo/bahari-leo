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

export class AiRateLimitError extends Error {
  readonly retryAfterSec: number;

  constructor(retryAfterSec: number) {
    super('AI rate limit reached');
    this.name = 'AiRateLimitError';
    this.retryAfterSec = retryAfterSec;
  }
}

@Injectable({ providedIn: 'root' })
export class AiEdition {
  configured(): boolean {
    return Boolean(environment.functionsBaseUrl);
  }

  async fetchEdition(placeId: string, abortSignal?: AbortSignal): Promise<ComicEdition> {
    return this.postJson<ComicEdition>('/generateEdition', { placeId }, abortSignal);
  }

  async fetchCoverArt(input: CoverArtRequest, abortSignal?: AbortSignal): Promise<CoverArtResponse> {
    return this.postJson<CoverArtResponse>(
      '/generateCoverArt',
      {
        placeId: input.placeId,
        placeName: input.placeName,
        county: input.county,
        mood: input.story.mood,
        headline: input.story.headline,
        blurb: input.story.blurb,
      },
      abortSignal,
    );
  }

  async fetchStoryCopies(placeIds: string[], abortSignal?: AbortSignal): Promise<Record<string, SeaStoryCopy>> {
    const body = await this.postJson<{ stories: Record<string, SeaStoryCopy> }>(
      '/generateStoryCopies',
      { placeIds },
      abortSignal,
    );
    return body.stories ?? {};
  }

  private async postJson<T>(
    path: string,
    body: unknown,
    abortSignal?: AbortSignal,
    attempt = 0,
  ): Promise<T> {
    const base = environment.functionsBaseUrl;
    if (!base) {
      throw new Error('AI edition is not configured');
    }

    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abortSignal,
    });

    if (response.status === 429 && attempt < 2) {
      const payload = (await response.json().catch(() => ({}))) as { retryAfterSec?: number };
      const retryAfterSec = payload.retryAfterSec ?? Number(response.headers.get('Retry-After') ?? 30);
      await sleep(Math.min(retryAfterSec, 45) * 1_000);
      return this.postJson<T>(path, body, abortSignal, attempt + 1);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new AiRateLimitError(Number(response.headers.get('Retry-After') ?? 30));
      }
      throw new Error(`AI request failed (${response.status})`);
    }

    return (await response.json()) as T;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
