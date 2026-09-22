import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CoastBoard } from '../../core/coast-board';
import { CoastState } from '../../core/coast-state';
import { RegionFilter } from '../../shared/region-filter/region-filter';

@Component({
  imports: [RegionFilter],
  selector: 'bahari-landings-page',
  styleUrl: './landings-page.css',
  templateUrl: './landings-page.html',
})
export class LandingsPage {
  protected readonly board = inject(CoastBoard);
  private readonly state = inject(CoastState);
  private readonly router = inject(Router);

  openOnMap(id: string): void {
    this.state.selectSite(id);
    void this.router.navigateByUrl('/map');
  }
}
