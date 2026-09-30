import { Injectable, signal } from '@angular/core';
import { AiEdition, AiRateLimitError, CoverArtRequest, CoverArtResponse } from './ai-edition';

export interface CoverArtSlot {
  loading: boolean;
  imageUrl?: string;
  failed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CoverArtCache {
  private readonly slots = signal<Record<string, CoverArtSlot>>({});
  private readonly inflight = new Map<string, Promise<CoverArtResponse>>();

  /** Reactive read — use inside computed() so UI updates when slots change. */
  readonly store = this.slots.asReadonly();

  slot(placeId: string): CoverArtSlot | null {
    return this.slots()[placeId] ?? null;
  }

  request(ai: AiEdition, input: CoverArtRequest): void {
    const placeId = input.placeId;
    const current = this.slot(placeId);
    if (current?.loading || current?.imageUrl || current?.failed) {
      return;
    }

    let promise = this.inflight.get(placeId);
    if (!promise) {
      this.setSlot(placeId, { loading: true });
      promise = ai.fetchCoverArt(input);
      this.inflight.set(placeId, promise);
    }

    void promise
      .then((result) => {
        this.setSlot(
          placeId,
          result.imageUrl ? { loading: false, imageUrl: result.imageUrl } : { loading: false, failed: true },
        );
      })
      .catch((err) => {
        if (err instanceof AiRateLimitError) {
          this.setSlot(placeId, { loading: false });
          window.setTimeout(() => {
            this.clearSlot(placeId);
            this.request(ai, input);
          }, err.retryAfterSec * 1_000);
          return;
        }
        this.setSlot(placeId, { loading: false, failed: true });
      })
      .finally(() => {
        this.inflight.delete(placeId);
      });
  }

  private setSlot(placeId: string, slot: CoverArtSlot): void {
    this.slots.update((all) => ({ ...all, [placeId]: slot }));
  }

  private clearSlot(placeId: string): void {
    this.slots.update((all) => {
      const next = { ...all };
      delete next[placeId];
      return next;
    });
  }
}
