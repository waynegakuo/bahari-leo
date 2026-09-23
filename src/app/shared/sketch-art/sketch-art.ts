import { Component, input } from '@angular/core';

export type SketchArtKind = 'coast' | 'waves' | 'sun' | 'boat' | 'fish' | 'dolphin' | 'pin';
export type SketchArtSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bahari-sketch-art',
  styleUrl: './sketch-art.css',
  host: {
    '[attr.data-kind]': 'kind()',
    '[attr.data-size]': 'size()',
    'aria-hidden': 'true',
  },
  template: `
    @switch (kind()) {
      @case ('coast') {
        <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="95" cy="18" r="11" stroke="currentColor" stroke-width="2.2" />
          <path d="M8 52 Q30 44 52 50 T96 48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          <path d="M4 62 Q35 54 60 60 T112 58" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.7" />
          <path d="M10 72 Q40 66 70 70 T110 68" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.5" />
          <path d="M78 38 L82 28 M88 36 L92 26" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      }
      @case ('waves') {
        <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 20 Q20 12 36 20 T68 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          <path d="M2 30 Q22 24 42 28 T76 26" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.65" />
        </svg>
      }
      @case ('sun') {
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="10" stroke="currentColor" stroke-width="2.2" />
          <path d="M24 6 V12 M24 36 V42 M6 24 H12 M36 24 H42 M11 11 L15 15 M33 33 L37 37 M11 37 L15 33 M33 15 L37 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      }
      @case ('boat') {
        <svg viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 34 Q32 28 56 34 L52 40 Q32 36 12 40 Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
          <path d="M32 34 V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M32 16 L48 24 L32 30 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        </svg>
      }
      @case ('fish') {
        <svg viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 20 Q24 8 44 20 Q24 32 8 20 Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
          <path d="M44 20 L56 12 L56 28 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <circle cx="22" cy="18" r="2" fill="currentColor" />
        </svg>
      }
      @case ('dolphin') {
        <svg viewBox="0 0 72 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 28 Q28 12 48 24 Q58 30 64 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          <path d="M48 20 Q52 8 58 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <circle cx="30" cy="22" r="2" fill="currentColor" />
        </svg>
      }
      @case ('pin') {
        <svg viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="20" cy="13" rx="12" ry="11" stroke="currentColor" stroke-width="2.4" fill="currentColor" fill-opacity="0.28" />
          <path d="M14 7 Q20 2 26 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.5" />
          <path d="M20 23 V32" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          <circle cx="20" cy="33.5" r="1.6" fill="currentColor" />
        </svg>
      }
    }
  `,
})
export class SketchArt {
  readonly kind = input<SketchArtKind>('coast');
  readonly size = input<SketchArtSize>('md');
}
