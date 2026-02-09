import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

/**
 * StatusBadgeComponent displays a colored badge for status values
 * Usage: <app-status-badge [status]="'Active'" [type]="'account'"></app-status-badge>
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  template: `
    <mat-chip [class]="'status-badge-' + getStatusClass()">
      {{ status }}
    </mat-chip>
  `,
  styles: [
    `
      mat-chip {
        font-size: 12px;
        font-weight: 500;
        padding: 4px 12px;
        height: auto;
      }

      /* Account statuses */
      .status-badge-active {
        background-color: #4caf50 !important;
        color: white !important;
      }

      .status-badge-inactive {
        background-color: #9e9e9e !important;
        color: white !important;
      }

      /* Invoice statuses */
      .status-badge-draft {
        background-color: #ff9800 !important;
        color: white !important;
      }

      .status-badge-issued {
        background-color: #2196f3 !important;
        color: white !important;
      }

      .status-badge-paid {
        background-color: #4caf50 !important;
        color: white !important;
      }

      .status-badge-overdue {
        background-color: #f44336 !important;
        color: white !important;
      }

      /* Transaction types */
      .status-badge-ridecharge {
        background-color: #9c27b0 !important;
        color: white !important;
      }

      .status-badge-paymentreceived {
        background-color: #00bcd4 !important;
        color: white !important;
      }

      /* Default */
      .status-badge-default {
        background-color: #757575 !important;
        color: white !important;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() type: 'account' | 'invoice' | 'transaction' | 'default' = 'default';

  getStatusClass(): string {
    return this.status.toLowerCase().replace(/\s+/g, '');
  }
}
