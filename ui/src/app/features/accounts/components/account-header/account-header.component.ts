import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Account } from '@models/account.model';
import { CurrencyFormatPipe } from '@shared/pipes/currency-format.pipe';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

/**
 * AccountHeaderComponent displays key account information in a header
 */
@Component({
  selector: 'app-account-header',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    CurrencyFormatPipe,
    StatusBadgeComponent,
  ],
  template: `
    <mat-card class="account-header">
      <div class="header-content">
        <div class="account-info">
          <div class="account-icon">
            <mat-icon>{{ getAccountIcon() }}</mat-icon>
          </div>
          <div class="account-details">
            <h1 class="account-name">{{ account.name }}</h1>
            <p class="account-number">Account #{{ account.accountNumber }}</p>
          </div>
        </div>

        <div class="account-meta">
          <div class="meta-item">
            <span class="label">Type:</span>
            <span class="value">{{ account.type }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Status:</span>
            <app-status-badge [status]="account.status" [type]="'account'"></app-status-badge>
          </div>
          <div class="meta-item">
            <span class="label">Current Balance:</span>
            <span class="value balance" [class.negative]="account.currentBalance < 0">
              {{ account.currentBalance | currencyFormat }}
            </span>
          </div>
        </div>
      </div>
    </mat-card>
  `,
  styles: [
    `
      .account-header {
        margin-bottom: 24px;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;

        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      .account-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .account-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: #e3f2fd;
        color: #1976d2;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      .account-name {
        margin: 0 0 4px 0;
        font-size: 28px;
        font-weight: 500;
        color: #333;
      }

      .account-number {
        margin: 0;
        font-size: 14px;
        color: #666;
        font-family: 'Courier New', monospace;
      }

      .account-meta {
        display: flex;
        gap: 32px;

        @media (max-width: 768px) {
          width: 100%;
          justify-content: space-between;
        }
      }

      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .label {
        font-size: 12px;
        color: #999;
        text-transform: uppercase;
        font-weight: 500;
      }

      .value {
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }

      .balance {
        font-family: 'Courier New', monospace;
      }

      .balance.negative {
        color: #f44336;
      }
    `,
  ],
})
export class AccountHeaderComponent {
  @Input() account!: Account;

  getAccountIcon(): string {
    return this.account.type === 'Organization' ? 'business' : 'person';
  }
}
