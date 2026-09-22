import { Component, inject } from '@angular/core';
import { RegionFilter } from '../../shared/region-filter/region-filter';
import { CoastState } from '../../core/coast-state';
import { OverlayKey } from '../../core/models';

@Component({
  imports: [RegionFilter],
  selector: 'bahari-layer-dock',
  styleUrl: './layer-dock.css',
  templateUrl: './layer-dock.html',
})
export class LayerDock {
  protected readonly state = inject(CoastState);

  onDate(event: Event): void {
    this.state.setOverlayDate((event.target as HTMLInputElement).value);
  }

  toggle(key: OverlayKey): void {
    this.state.toggleOverlay(key);
  }
}
