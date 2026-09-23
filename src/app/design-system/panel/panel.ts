import { Component, input } from '@angular/core';

export type SectionTone = 'plain' | 'subtle';
export type SectionDivider = 'none' | 'top' | 'bottom';
export type SectionPadding = 'none' | 'sm' | 'md' | 'lg';
export type SectionMood = 'kind' | 'rough' | 'restless' | null;

@Component({
  selector: 'bl-section',
  styleUrl: './panel.css',
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-divider]': 'divider()',
    '[attr.data-padding]': 'padding()',
    '[attr.data-mood]': 'mood()',
    '[class.bl-section--interactive]': 'interactive()',
  },
  template: '<div class="inner"><ng-content /></div>',
})
export class BlSection {
  readonly tone = input<SectionTone>('plain');
  readonly divider = input<SectionDivider>('none');
  readonly padding = input<SectionPadding>('md');
  readonly mood = input<SectionMood>(null);
  readonly interactive = input(false);
}

/** @deprecated Use BlSection — kept as alias for gradual migration */
export const BlPanel = BlSection;
