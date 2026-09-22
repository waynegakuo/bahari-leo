import { Component, computed, inject, linkedSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CoastBoard } from '../../core/coast-board';
import { CoastState } from '../../core/coast-state';
import { SiteBoardRow } from '../../core/models';
import { greetingForNow, whaleSeasonNow, wildlifeLine } from '../../core/plain-speak';
import { RegionFilter } from '../../shared/region-filter/region-filter';

@Component({
  imports: [RegionFilter, RouterLink],
  selector: 'bahari-today-page',
  styleUrl: './today-page.css',
  templateUrl: './today-page.html',
})
export class TodayPage {
  protected readonly board = inject(CoastBoard);
  private readonly state = inject(CoastState);
  private readonly router = inject(Router);

  protected readonly greeting = greetingForNow();
  protected readonly featured = linkedSignal(() => this.board.todaysPick());
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
      this.featured.set(next);
    }
  }

  openCard(row: SiteBoardRow): void {
    this.featured.set(row);
  }
}
