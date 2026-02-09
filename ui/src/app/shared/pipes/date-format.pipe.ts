import { Pipe, PipeTransform } from '@angular/core';
import { format, parseISO } from 'date-fns';

/**
 * DateFormatPipe formats ISO 8601 date strings
 * Usage: {{ dateString | dateFormat }} or {{ dateString | dateFormat:'MM/dd/yyyy' }}
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    formatString: string = 'MMM d, yyyy'
  ): string {
    if (!value) {
      return '';
    }

    try {
      const date = parseISO(value);
      return format(date, formatString);
    } catch (error) {
      console.error('Invalid date format:', value, error);
      return value;
    }
  }
}
