import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="invoice-list-container">
      <h1>Invoices</h1>
      <p>Coming soon...</p>
    </div>
  `,
  styles: [
    `
      .invoice-list-container {
        padding: 24px;
      }
    `,
  ],
})
export class InvoiceListComponent {}
