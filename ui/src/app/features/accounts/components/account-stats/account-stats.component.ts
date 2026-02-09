import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Account } from '@models/account.model';
import { CurrencyFormatPipe } from '@shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';

/**
 * AccountStatsComponent displays account statistics and metrics
 */
@Component({
  selector: 'app-account-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    CurrencyFormatPipe,
    DateFormatPipe,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Quick Stats</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon balance">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="stat-details">
              <p class="stat-label">Current Balance</p>
              <p class="stat-value" [class.negative]="account.currentBalance < 0">
                {{ account.currentBalance | currencyFormat }}
              </p>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon activity">
              <mat-icon>event</mat-icon>
            </div>
            <div class="stat-details">
              <p class="stat-label">Account Age</p>
              <p class="stat-value">{{ getAccountAge() }}</p>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon type">
              <mat-icon>{{ account.type === 'Organization' ? 'business' : 'person' }}</mat-icon>
            </div>
            <div class="stat-details">
              <p class="stat-label">Account Type</p>
              <p class="stat-value">{{ account.type }}</p>
            </div>
          </div>
        </div>

        <div class="info-message">
          <mat-icon>info</mat-icon>
          <p>Transaction and invoice metrics will be available after Phase 4 & 5 implementation.</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      mat-card {
        height: 100%;
      }

      .stats-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 8px;
      }

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 50%;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      .stat-icon.balance {
        background-color: #e8f5e9;
        color: #4caf50;
      }

      .stat-icon.activity {
        background-color: #e3f2fd;
        color: #2196f3;
      }

      .stat-icon.type {
        background-color: #f3e5f5;
        color: #9c27b0;
      }

      .stat-details {
        flex: 1;
      }

      .stat-label {
        margin: 0 0 4px 0;
        font-size: 12px;
        color: #999;
        text-transform: uppercase;
        font-weight: 500;
      }

      .stat-value {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }

      .stat-value.negative {
        color: #f44336;
      }

      .info-message {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-top: 20px;
        padding: 12px;
        background-color: #e3f2fd;
        border-radius: 4px;

        mat-icon {
          color: #2196f3;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #1565c0;
          flex: 1;
        }
      }
    `,
  ],
})
export class AccountStatsComponent {
  @Input() account!: Account;

  getAccountAge(): string {
    const createdDate = new Date(this.account.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day';
    } else if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month' : `${months} months`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 year' : `${years} years`;
    }
  }
}
