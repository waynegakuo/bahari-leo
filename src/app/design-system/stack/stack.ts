import { Component, input } from '@angular/core';

export type StackGap = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bl-stack',
  styleUrl: './stack.css',
  host: { '[attr.data-gap]': 'gap()' },
  template: '<div class="stack"><ng-content /></div>',
})
export class BlStack {
  readonly gap = input<StackGap>('md');
}
