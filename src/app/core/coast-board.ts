import { computed, inject, Injectable, resource } from '@angular/core';
import { AiEdition } from './ai-edition';
import { scoreConditions, toBoardRows } from './advisory';
import { CoastState } from './coast-state';
import { MarineApi } from './marine-api';
import { FORECAST_UNAVAILABLE, InspectReading, SiteBoardRow } from './models';
import { tellSeaStory } from './plain-speak';
import { mergeStoryCopies } from './story-copy';

@Injectable({ providedIn: 'root' })
export class CoastBoard {
  private readonly state = inject(CoastState);
  private readonly api = inject(MarineApi);
  private readonly ai = inject(AiEdition);

  readonly marineResource = resource({
    params: () => this.state.sites(),
    loader: async ({ params, abortSignal }): Promise<SiteBoardRow[]> => {
      const snapshots = await this.api.fetchSites(params, abortSignal);
      return toBoardRows(params, snapshots);
    },
  });

  readonly storyCopiesResource = resource({
    params: () => {
      if (!this.ai.configured() || !this.marineResource.hasValue()) {
        return undefined;
      }
      const rows = this.marineResource.value();
      if (!rows?.length) {
        return undefined;
      }
      return rows.map((row) => row.site.id);
    },
    loader: async ({ params, abortSignal }) =>
      this.ai.fetchStoryCopies(params, abortSignal),
  });

  /** @deprecated Use marineResource / storyCopiesResource — kept for other pages */
  readonly boardResource = {
    isLoading: () => this.isBoardLoading(),
    error: () => this.marineResource.error() ?? this.storyCopiesResource.error(),
    hasValue: () => this.marineResource.hasValue() && this.storiesReady(),
  };

  readonly isBoardLoading = computed(
    () =>
      this.marineResource.isLoading() ||
      (this.ai.configured() && this.storyCopiesResource.isLoading()),
  );

  readonly aiStoriesLoading = computed(
    () => this.ai.configured() && this.storyCopiesResource.isLoading(),
  );

  readonly marineLoading = computed(() => this.marineResource.isLoading());

  readonly rows = computed(() => {
    const base = this.marineResource.value();
    if (!base) {
      return [];
    }
    const copies = this.storyCopiesResource.value();
    if (copies) {
      return mergeStoryCopies(base, copies);
    }
    return base;
  });

  readonly inspectResource = resource({
    params: () => this.state.selected(),
    loader: async ({ params, abortSignal }): Promise<InspectReading> => {
      const marine = await this.api.fetchPoint(params.lat, params.lon, abortSignal);
      const advisory = scoreConditions(marine);
      return { marine, advisory, story: tellSeaStory(marine, advisory) };
    },
  });

  readonly favouredCount = computed(
    () => this.rows().filter((row) => row.story?.mood === 'kind').length,
  );
  readonly inspectError = computed(() =>
    this.inspectResource.error() ? FORECAST_UNAVAILABLE : null,
  );
  readonly todaysPick = computed(() => pickForToday(this.rows()));
  readonly alsoToday = computed(() =>
    this.rows()
      .filter((row) => row.site.id !== this.todaysPick()?.site.id && row.story)
      .slice(0, 3),
  );
  readonly dolphinWatch = computed(() =>
    this.rows().find((row) => row.site.watch === 'dolphins' && row.story) ?? null,
  );

  surprise(): SiteBoardRow | null {
    const pick = this.todaysPick();
    if (!pick) {
      return null;
    }
    this.state.selectSite(pick.site.id);
    return pick;
  }

  private storiesReady(): boolean {
    if (!this.marineResource.hasValue()) {
      return false;
    }
    if (!this.ai.configured()) {
      return true;
    }
    return this.storyCopiesResource.hasValue() || Boolean(this.storyCopiesResource.error());
  }
}

function pickForToday(rows: SiteBoardRow[]): SiteBoardRow | null {
  const kind = rows.filter((row) => row.story?.mood === 'kind');
  const restless = rows.filter((row) => row.story?.mood === 'restless');
  const pool = kind.length ? kind : restless.length ? restless : rows;
  if (pool.length === 0) {
    return null;
  }
  const day = new Date().getDate();
  return pool[day % pool.length] ?? pool[0];
}
