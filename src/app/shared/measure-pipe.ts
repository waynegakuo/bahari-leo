import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'measure',
})
export class MeasurePipe implements PipeTransform {
  transform(value: number | null | undefined, digits = '1.1-1', unit = ''): string {
    if (value === null || value === undefined) {
      return '—';
    }
    return `${formatNumber(value, 'en-KE', digits)}${unit}`;
  }
}
