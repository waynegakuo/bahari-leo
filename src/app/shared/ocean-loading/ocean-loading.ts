import { Component, input } from '@angular/core';
import { SketchArt } from '../sketch-art/sketch-art';

@Component({
  imports: [SketchArt],
  selector: 'bahari-ocean-loading',
  styleUrl: './ocean-loading.css',
  template: `
    <div class="ocean-load" role="status" [attr.aria-label]="message()">
      <div class="ocean-load__scene" aria-hidden="true">
        <bahari-sketch-art kind="coast" size="lg" class="ocean-load__coast" />
        <bahari-sketch-art kind="waves" size="md" class="ocean-load__waves" />
        <bahari-sketch-art kind="dolphin" size="md" class="ocean-load__dolphin" />
        <bahari-sketch-art kind="boat" size="sm" class="ocean-load__boat" />
      </div>
      <p class="ocean-load__message bl-display">{{ message() }}</p>
    </div>
  `,
})
export class OceanLoading {
  readonly message = input('Listening to the coast…');
}
