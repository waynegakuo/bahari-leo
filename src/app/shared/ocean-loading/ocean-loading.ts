import { Component, DestroyRef, inject, input, signal } from '@angular/core';

export const COAST_LOADING_MESSAGES = [
  'Walking down to the water…',
  'Listening to the coast…',
  'Reading the tide…',
  'Checking the wind…',
  'Asking the sea how it feels…',
  'Tracing the shoreline…',
  'Gathering the morning light…',
  'Writing today\'s story…',
] as const;

export const EDITION_LOADING_MESSAGES = [
  'Inking today\'s edition…',
  'Sketching the panels…',
  'Drawing the waves…',
  'Adding the captions…',
  'Pinning the thumbtacks…',
  'Almost ready…',
] as const;

@Component({
  selector: 'bahari-ocean-loading',
  styleUrl: './ocean-loading.css',
  template: `
    <div class="ocean-load" role="status" [attr.aria-label]="currentMessage()">
      <div class="ocean-load__spinner" aria-hidden="true"></div>
      @for (line of [currentMessage()]; track line) {
        <p class="ocean-load__message bl-display" aria-live="polite">{{ line }}</p>
      }
    </div>
  `,
})
export class OceanLoading {
  readonly messages = input<string[]>([...COAST_LOADING_MESSAGES]);
  readonly rotateMs = input(2_400);

  protected readonly currentMessage = signal('Listening to the coast…');

  private readonly destroyRef = inject(DestroyRef);
  private messageIndex = 0;

  constructor() {
    const list = this.messages();
    this.currentMessage.set(list[0] ?? 'Listening to the coast…');

    if (list.length <= 1) {
      return;
    }

    const tick = () => {
      const active = this.messages();
      this.messageIndex = (this.messageIndex + 1) % active.length;
      this.currentMessage.set(active[this.messageIndex]!);
    };

    const intervalId = window.setInterval(tick, this.rotateMs());
    this.destroyRef.onDestroy(() => window.clearInterval(intervalId));
  }
}
