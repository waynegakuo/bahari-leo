import { Component, inject, input, output } from '@angular/core';
import { CoastState } from '../../core/coast-state';
import { REGIONS } from '../../core/kenya-coast';
import { RegionId } from '../../core/models';
import { BlChip } from '../../design-system';

@Component({
  imports: [BlChip],
  selector: 'bahari-region-filter',
  styleUrl: './region-filter.css',
  templateUrl: './region-filter.html',
})
export class RegionFilter {
  readonly showSummary = input(false);
  readonly layout = input<'row' | 'stack'>('row');
  readonly regionSelected = output<RegionId>();
  protected readonly state = inject(CoastState);
  protected readonly regions = REGIONS;

  select(id: RegionId): void {
    this.state.setRegion(id);
    this.regionSelected.emit(id);
  }
}
