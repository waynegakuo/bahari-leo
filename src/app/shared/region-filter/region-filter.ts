import { Component, inject, input } from '@angular/core';
import { CoastState } from '../../core/coast-state';
import { REGIONS } from '../../core/kenya-coast';
import { RegionId } from '../../core/models';

@Component({
  imports: [],
  selector: 'bahari-region-filter',
  styleUrl: './region-filter.css',
  templateUrl: './region-filter.html',
})
export class RegionFilter {
  readonly showSummary = input(false);
  protected readonly state = inject(CoastState);
  protected readonly regions = REGIONS;

  select(id: RegionId): void {
    this.state.setRegion(id);
  }
}
