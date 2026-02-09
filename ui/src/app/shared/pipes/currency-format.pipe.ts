import { Pipe, PipeTransform } from '@angular/core';

/**
 * CurrencyFormatPipe formats numbers as USD currency
 * Usage: {{ amount | currencyFormat }}
 */
@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  private formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '$0.00';
    }

    return this.formatter.format(value);
  }
}
