import { Component, inject } from '@angular/core';
import { CoastBoard } from '../../core/coast-board';
import { CoastState } from '../../core/coast-state';
import { formatCoord } from '../../core/kenya-coast';
import { MeasurePipe } from '../../shared/measure-pipe';

@Component({
  imports: [MeasurePipe],
  selector: 'bahari-inspect-panel',
  styleUrl: './inspect-panel.css',
  templateUrl: './inspect-panel.html',
})
export class InspectPanel {
  protected readonly state = inject(CoastState);
  protected readonly board = inject(CoastBoard);
  protected readonly formatCoord = formatCoord;
}
