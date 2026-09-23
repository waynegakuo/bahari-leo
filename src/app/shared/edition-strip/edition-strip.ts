import { Component, input } from '@angular/core';
import { ComicEdition } from '../../core/sea-story-brief';

@Component({
  imports: [],
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

  protected labelFor(index: number): string {
    return ['The water', 'The breeze', 'What to do'][index] ?? 'Panel';
  }
}
