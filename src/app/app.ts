import { Component } from '@angular/core';
import { Shell } from './layout/shell/shell';

@Component({
  selector: 'bahari-root',
  imports: [Shell],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
