import { Component, input } from '@angular/core';

export type BlButtonVariant = 'primary' | 'secondary' | 'ghost';
export type BlButtonSize = 'sm' | 'md';

@Component({
  selector: 'bl-button',
  styleUrl: './button.css',
  template: `
    <button
      type="button"
      class="btn"
      [attr.data-variant]="variant()"
      [attr.data-size]="size()"
      [disabled]="disabled()"
    >
      <ng-content />
    </button>
  `,
})
export class BlButton {
  readonly variant = input<BlButtonVariant>('primary');
  readonly size = input<BlButtonSize>('md');
  readonly disabled = input(false);
}
