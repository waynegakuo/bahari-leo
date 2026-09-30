import { Injectable, signal } from '@angular/core';
import { AiEdition } from './ai-edition';
import { ComicEdition } from './sea-story-brief';

@Injectable({ providedIn: 'root' })
export class EditionCache {
  private readonly editions = signal<Record<string, ComicEdition>>({});
  private readonly inflight = new Map<string, Promise<ComicEdition>>();

  /** Reactive read — use inside computed() so UI updates when editions change. */
  readonly store = this.editions.asReadonly();

  edition(placeId: string): ComicEdition | null {
    return this.editions()[placeId] ?? null;
  }

  /** Return a cached edition or fetch once per place for this session. */
  async fetchEdition(ai: AiEdition, placeId: string): Promise<ComicEdition> {
    const cached = this.edition(placeId);
    if (cached) {
      return cached;
    }

    let promise = this.inflight.get(placeId);
    if (!promise) {
      promise = ai.fetchEdition(placeId);
      this.inflight.set(placeId, promise);
    }

    try {
      const edition = await promise;
      this.setEdition(placeId, edition);
      return edition;
    } finally {
      this.inflight.delete(placeId);
    }
  }

  private setEdition(placeId: string, edition: ComicEdition): void {
    this.editions.update((all) => ({ ...all, [placeId]: edition }));
  }
}
