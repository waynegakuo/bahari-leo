import { Component, input } from '@angular/core';

export type BlBadgeTone = 'ok' | 'neutral' | 'warn';

@Component({
  selector: 'bl-badge',
  styleUrl: './badge.css',
  template: '<span class="badge" [attr.data-tone]="tone()"><ng-content /></span>',
})
export class BlBadge {
  readonly tone = input<BlBadgeTone>('neutral');
}
