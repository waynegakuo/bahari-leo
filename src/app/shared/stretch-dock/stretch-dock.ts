import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { CoastState } from '../../core/coast-state';
import { BlKicker } from '../../design-system';
import { RegionFilter } from '../region-filter/region-filter';
import { SketchArt } from '../sketch-art/sketch-art';

@Component({
  imports: [BlKicker, RegionFilter, SketchArt],
  selector: 'bahari-stretch-dock',
  styleUrl: './stretch-dock.css',
  templateUrl: './stretch-dock.html',
})
export class StretchDock {
  readonly greeting = input<string | null>(null);
  readonly title = input('Which stretch?');

  protected readonly open = signal(false);
  /** Stops the nudge animation after the user has opened the dock once */
  protected readonly settled = signal(false);
  protected readonly state = inject(CoastState);
  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.document.body.classList.remove('stretch-dock-open');
    });
  }

  toggle(): void {
    this.open.update((value) => {
      if (!value) {
        this.settled.set(true);
      }
      return !value;
    });
    this.syncBodyScroll();
  }

  close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.syncBodyScroll();
  }

  onRegionSelected(): void {
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  private syncBodyScroll(): void {
    this.document.body.classList.toggle('stretch-dock-open', this.open());
  }
}
