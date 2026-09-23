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

  readonly boardResource = resource({
    params: () => ({
      sites: this.state.sites(),
      aiStories: this.ai.configured(),
    }),
    loader: async ({ params, abortSignal }): Promise<SiteBoardRow[]> => {
      const snapshots = await this.api.fetchSites(params.sites, abortSignal);
      let rows = toBoardRows(params.sites, snapshots);
      if (params.aiStories && rows.length) {
        try {
          const copies = await this.ai.fetchStoryCopies(
            params.sites.map((site) => site.id),
            abortSignal,
          );
          rows = mergeStoryCopies(rows, copies);
        } catch (err) {
          console.warn('AI story copy failed; using template brief', err);
        }
      }
      return rows;
    },
  });

  readonly inspectResource = resource({
    params: () => this.state.selected(),
    loader: async ({ params, abortSignal }): Promise<InspectReading> => {
      const marine = await this.api.fetchPoint(params.lat, params.lon, abortSignal);
      const advisory = scoreConditions(marine);
      return { marine, advisory, story: tellSeaStory(marine, advisory) };
    },
  });

  readonly rows = computed(() => this.boardResource.value() ?? []);
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
