import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoastBoard } from '../../core/coast-board';
import { CoastState } from '../../core/coast-state';
import { CoastMap } from '../../map/coast-map/coast-map';
import { InspectPanel } from '../../map/inspect-panel/inspect-panel';
import { LayerDock } from '../../map/layer-dock/layer-dock';

@Component({
  imports: [CoastMap, InspectPanel, LayerDock, RouterLink],
  selector: 'bahari-map-page',
  styleUrl: './map-page.css',
  templateUrl: './map-page.html',
})
export class MapPage {
  protected readonly state = inject(CoastState);
  protected readonly board = inject(CoastBoard);
  protected readonly layersOpen = signal(false);

  toggleLayers(): void {
    this.layersOpen.update((open) => !open);
  }

  closeLayers(): void {
    this.layersOpen.set(false);
  }

  goSomewhere(): void {
    this.closeLayers();
    this.board.surprise();
  }
}
