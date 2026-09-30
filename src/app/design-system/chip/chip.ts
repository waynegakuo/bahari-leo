import { Component, input, output } from '@angular/core';

export type BlChipTone = 'dark' | 'light';

@Component({
  host: {
    '[attr.data-tone]': 'tone()',
  },
  selector: 'bl-chip',
  styleUrl: './chip.css',
  template: `
    <button
      type="button"
      class="chip"
      role="radio"
      [class.chip--on]="selected()"
      [attr.aria-checked]="selected()"
      [disabled]="disabled()"
      (click)="selectedChange.emit(true)"
    >
      <ng-content />
    </button>
  `,
})
export class BlChip {
  readonly selected = input(false);
  readonly disabled = input(false);
  /** Light tone for paper/surface backgrounds; dark for tide/sea panels */
  readonly tone = input<BlChipTone>('dark');
  readonly selectedChange = output<boolean>();
}
