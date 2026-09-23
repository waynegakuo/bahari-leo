import { Component, input } from '@angular/core';

@Component({
  selector: 'bl-page',
  styleUrl: './page.css',
  template: '<div class="page" [class.page--wide]="wide()"><ng-content /></div>',
})
export class BlPage {
  readonly wide = input(false);
}
