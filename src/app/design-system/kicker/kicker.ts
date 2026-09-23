import { Component } from '@angular/core';

@Component({
  selector: 'bl-kicker',
  styleUrl: './kicker.css',
  template: '<p class="kicker"><ng-content /></p>',
})
export class BlKicker {}
