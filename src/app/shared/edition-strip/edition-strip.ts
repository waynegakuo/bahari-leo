import { Component, input } from '@angular/core';
import { ComicEdition } from '../../core/sea-story-brief';
import { BlKicker } from '../../design-system';
import { SketchArt } from '../sketch-art/sketch-art';

@Component({
  host: {
    '[class.edition-strip--featured]': 'featured()',
  },
  imports: [BlKicker, SketchArt],
  selector: 'bahari-edition-strip',
  styleUrl: './edition-strip.css',
  templateUrl: './edition-strip.html',
})
export class EditionStrip {
  readonly panels = input<ComicEdition['panels']>([]);
  readonly title = input<string | null>(null);
  readonly footer = input<string | null>(null);
  readonly loading = input(false);
  readonly generated = input(false);
  /** Larger layout for the Today page tab panel */
  readonly featured = input(false);

  protected readonly panelLabels = [
    'The water',
    'The breeze',
    'The temperature',
    'Local voice',
    'The day',
    'What to do',
  ] as const;

  protected labelFor(index: number): string {
    return this.panelLabels[index] ?? 'Panel';
  }
}
