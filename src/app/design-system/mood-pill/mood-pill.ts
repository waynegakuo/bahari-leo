import { Component, computed, input } from '@angular/core';
import { SeaMood } from '../../core/models';

@Component({
  selector: 'bl-mood-pill',
  styleUrl: './mood-pill.css',
  host: { '[attr.data-mood]': 'mood()' },
  template: '<span class="pill">{{ label() }}</span>',
})
export class BlMoodPill {
  readonly mood = input<SeaMood | null>(null);

  protected readonly label = computed(() => {
    switch (this.mood()) {
      case 'kind':
        return 'Kind sea';
      case 'restless':
        return 'A bit restless';
      case 'rough':
        return 'Stay on the sand';
      default:
        return 'Listening…';
    }
  });
}
