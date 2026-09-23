import { Component, input } from '@angular/core';
import { SeaMood } from '../../core/models';

export type CardTone = 'default' | 'warm' | 'tide' | 'foam';
export type CardPadding = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bl-card',
  styleUrl: './card.css',
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-padding]': 'padding()',
    '[attr.data-mood]': 'mood()',
    '[class.bl-card--interactive]': 'interactive()',
  },
  template: '<div class="card"><ng-content /></div>',
})
export class BlCard {
  readonly tone = input<CardTone>('default');
  readonly padding = input<CardPadding>('md');
  readonly mood = input<SeaMood | null>(null);
  readonly interactive = input(false);
}
