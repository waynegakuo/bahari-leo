import { Component, input, output } from '@angular/core';

@Component({
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
  readonly selectedChange = output<boolean>();
}
