import { Component, computed, DestroyRef, inject, linkedSignal, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AiEdition } from '../../core/ai-edition';
import { CoastBoard } from '../../core/coast-board';
import { CoastState } from '../../core/coast-state';
import { ActivityHint, SiteBoardRow } from '../../core/models';
import { ComicEdition } from '../../core/sea-story-brief';
import { greetingForNow, whaleSeasonNow, wildlifeLine } from '../../core/plain-speak';
import {
  BlBadge,
  BlButton,
  BlCard,
  BlKicker,
  BlMoodPill,
} from '../../design-system';
import { EditionStrip } from '../../shared/edition-strip/edition-strip';
import { SketchArt } from '../../shared/sketch-art/sketch-art';
import {
  COAST_LOADING_MESSAGES,
  EDITION_LOADING_MESSAGES,
  OceanLoading,
} from '../../shared/ocean-loading/ocean-loading';
import { StretchDock } from '../../shared/stretch-dock/stretch-dock';

type TodayView = 'brief' | 'edition';

@Component({
  imports: [
    StretchDock,
    OceanLoading,
    RouterLink,
    EditionStrip,
    SketchArt,
    BlKicker,
    BlMoodPill,
    BlCard,
    BlButton,
    BlBadge,
  ],
  selector: 'bahari-today-page',
  styleUrl: './today-page.css',
  templateUrl: './today-page.html',
})
export class TodayPage {
  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.briefSwapTimer !== undefined) {
        window.clearTimeout(this.briefSwapTimer);
      }
    });
  }
  protected readonly view = signal<TodayView>('brief');
  protected readonly briefSwapping = signal(false);
  protected readonly board = inject(CoastBoard);
  private readonly state = inject(CoastState);
  private readonly router = inject(Router);
  private readonly ai = inject(AiEdition);
  private readonly destroyRef = inject(DestroyRef);
  private briefSwapTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly greeting = greetingForNow();
  protected readonly atfLoading = computed(
    () => this.board.marineLoading() || this.board.aiStoriesLoading(),
  );
  protected readonly coastLoadingMessages = [...COAST_LOADING_MESSAGES];
  protected readonly editionLoadingMessages = [...EDITION_LOADING_MESSAGES];
  protected readonly atfReady = computed(() => {
    if (this.board.marineResource.error()) {
      return false;
    }
    if (!this.board.marineResource.hasValue()) {
      return false;
    }
    if (
      this.ai.configured() &&
      !this.board.storyCopiesResource.hasValue() &&
      !this.board.storyCopiesResource.error()
    ) {
      return false;
    }
    return Boolean(this.featured());
  });
  /** Resets to today's pick when the region changes; user can override via also-today / somewhere else */
  protected readonly featured = linkedSignal({
    source: () => this.state.region().id,
    computation: () => this.board.todaysPick(),
  });
  protected readonly editionResource = resource({
    params: () => {
      if (!this.ai.configured()) {
        return undefined;
      }
      const placeId = this.featured()?.site.id;
      return placeId ? { placeId } : undefined;
    },
    loader: ({ params, abortSignal }) => this.ai.fetchEdition(params.placeId, abortSignal),
  });
  /** Brief copy — from coast board only; never overwritten when edition loads */
  protected readonly briefStory = computed(() => this.featured()?.story ?? null);
  protected readonly panels = computed(() => {
    const story = this.briefStory();
    if (!story) {
      return [];
    }
    const fallback = this.fallbackPanels(story);
    const generated = this.generatedEdition();
    if (!generated?.panels.length) {
      return fallback;
    }
    if (generated.panels.length >= 6) {
      return generated.panels.slice(0, 6);
    }
    return fallback.map((panel, index) => generated.panels[index] ?? panel);
  });
  protected readonly editionTitle = computed(() => this.generatedEdition()?.editionTitle ?? null);
  protected readonly editionFooter = computed(
    () => this.generatedEdition()?.footer ?? 'Based on today’s forecast — not live wildlife.',
  );
  protected readonly editionIsGenerated = computed(() => this.editionResource.hasValue());
  protected readonly wildlife = computed(() => {
    const row = this.board.dolphinWatch() ?? (this.featured()?.site.watch === 'dolphins' ? this.featured() : null);
    if (!row?.story) {
      return {
        title: 'Want to see dolphins?',
        body: 'They live year-round off Shimoni (Kisite) and Watamu — not a live map, a known home. A licensed boat, and don’t chase.',
        action: 'See Shimoni',
        siteId: 'shimoni' as const,
        region: 'south' as const,
      };
    }
    return {
      title: 'Want to see dolphins?',
      body: wildlifeLine(row.site.name, row.story.mood, row.site.id === 'shimoni' && whaleSeasonNow()),
      action: `Go to ${row.site.name}`,
      siteId: row.site.id,
      region: row.site.region,
    };
  });

  private generatedEdition(): ComicEdition | null {
    return this.editionResource.hasValue() ? this.editionResource.value() : null;
  }

  goThere(id?: string): void {
    const target = id ?? this.featured()?.site.id;
    if (!target) {
      return;
    }
    this.state.selectSite(target);
    void this.router.navigateByUrl('/map');
  }

  goWildlife(): void {
    const tip = this.wildlife();
    this.state.setRegion(tip.region);
    this.state.selectSite(tip.siteId);
    void this.router.navigateByUrl('/map');
  }

  another(): void {
    const current = this.featured()?.site.id;
    const pool = this.board.rows().filter((row) => row.story && row.site.id !== current);
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (next) {
      this.queueBriefSwap(() => this.featured.set(next));
    }
  }

  openCard(row: SiteBoardRow): void {
    if (row.site.id === this.featured()?.site.id) {
      return;
    }
    this.queueBriefSwap(() => this.featured.set(row));
  }

  setView(next: TodayView): void {
    this.view.set(next);
  }

  private queueBriefSwap(swap: () => void): void {
    if (this.briefSwapping()) {
      return;
    }

    const delayMs = this.briefSwapDelayMs();
    if (delayMs === 0) {
      swap();
      return;
    }

    this.briefSwapping.set(true);
    this.briefSwapTimer = window.setTimeout(() => {
      swap();
      this.briefSwapping.set(false);
      this.briefSwapTimer = undefined;
    }, delayMs);
  }

  private briefSwapDelayMs(): number {
    if (typeof window === 'undefined') {
      return 280;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280;
  }

  private fallbackPanels(story: NonNullable<SiteBoardRow['story']>) {
    return [
      { caption: story.waves },
      { caption: story.wind },
      { caption: story.water },
      { caption: story.swahili },
      { caption: story.blurb },
      { caption: this.activityCaption(story.activities) },
    ];
  }

  private activityCaption(activities: ActivityHint[]): string {
    const yes = activities.filter((act) => act.ok).map((act) => act.label);
    const skip = activities.filter((act) => !act.ok).map((act) => act.label);
    const parts: string[] = [];
    if (yes.length) {
      parts.push(`Yes: ${yes.join(', ')}`);
    }
    if (skip.length) {
      parts.push(`Skip: ${skip.join(', ')}`);
    }
    return parts.join(' · ') || 'Stay flexible today.';
  }
}
