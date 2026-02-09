import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

import { LedgerTransaction } from '@models/ledger-transaction.model';
import { CurrencyFormatPipe } from '@shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

/**
 * LedgerDetailDialogComponent displays detailed information about a ledger transaction
 */
@Component({
  selector: 'app-ledger-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    CurrencyFormatPipe,
    DateFormatPipe,
    StatusBadgeComponent,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>receipt_long</mat-icon>
      Transaction Details
    </h2>

    <mat-dialog-content>
      <div class="transaction-header">
        <app-status-badge
          [status]="transaction.transactionType"
          [type]="'transaction'"
        ></app-status-badge>
        <span class="transaction-date">
          {{ transaction.transactionDate | dateFormat:'MMM d, yyyy h:mm a' }}
        </span>
      </div>

      <mat-divider></mat-divider>

      <div class="section">
        <h3>Transaction Information</h3>
        <mat-list>
          <mat-list-item>
            <span class="label">Transaction ID:</span>
            <span class="value">{{ transaction.transactionId }}</span>
          </mat-list-item>
          <mat-list-item>
            <span class="label">Description:</span>
            <span class="value">{{ transaction.description }}</span>
          </mat-list-item>
          <mat-list-item *ngIf="transaction.referenceId">
            <span class="label">Reference ID:</span>
            <span class="value reference">{{ transaction.referenceId }}</span>
          </mat-list-item>
          <mat-list-item *ngIf="transaction.referenceType">
            <span class="label">Reference Type:</span>
            <span class="value">{{ transaction.referenceType }}</span>
          </mat-list-item>
          <mat-list-item>
            <span class="label">Idempotency Key:</span>
            <span class="value">{{ transaction.idempotencyKey }}</span>
          </mat-list-item>
        </mat-list>
      </div>

      <mat-divider></mat-divider>

      <div class="section">
        <h3>Ledger Entries (Double-Entry Bookkeeping)</h3>
        <div class="entries-container">
          <div
            *ngFor="let entry of transaction.entries"
            class="entry-card"
            [class.debit]="entry.debitAmount > 0"
            [class.credit]="entry.creditAmount > 0"
          >
            <div class="entry-header">
              <mat-icon>{{ entry.debitAmount > 0 ? 'add_circle' : 'remove_circle' }}</mat-icon>
              <span class="entry-type">{{ entry.accountType }}</span>
            </div>
            <div class="entry-amounts">
              <div class="amount-row" *ngIf="entry.debitAmount > 0">
                <span class="amount-label">Debit:</span>
                <span class="amount-value debit-amount">
                  {{ entry.debitAmount | currencyFormat }}
                </span>
              </div>
              <div class="amount-row" *ngIf="entry.creditAmount > 0">
                <span class="amount-label">Credit:</span>
                <span class="amount-value credit-amount">
                  {{ entry.creditAmount | currencyFormat }}
                </span>
              </div>
            </div>
            <div class="entry-id">Entry ID: {{ entry.id }}</div>
          </div>
        </div>

        <div class="totals">
          <div class="total-row">
            <span class="total-label">Total Debits:</span>
            <span class="total-value debit-amount">{{ getTotalDebits() | currencyFormat }}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Total Credits:</span>
            <span class="total-value credit-amount">{{ getTotalCredits() | currencyFormat }}</span>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="section">
        <h3>Audit Information</h3>
        <mat-list>
          <mat-list-item>
            <span class="label">Created At:</span>
            <span class="value">{{ transaction.createdAt | dateFormat:'MMM d, yyyy h:mm a' }}</span>
          </mat-list-item>
          <mat-list-item>
            <span class="label">Created By:</span>
            <span class="value">{{ transaction.createdBy }}</span>
          </mat-list-item>
        </mat-list>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Close</button>
      <button
        mat-raised-button
        color="primary"
        [routerLink]="['/accounts', transaction.accountId]"
        [mat-dialog-close]="true"
      >
        <mat-icon>account_balance</mat-icon>
        View Account
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      h2[mat-dialog-title] {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;

        mat-icon {
          color: #1976d2;
        }
      }

      mat-dialog-content {
        padding: 24px;
        max-width: 600px;
      }

      .transaction-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .transaction-date {
        font-size: 14px;
        color: #666;
      }

      .section {
        margin: 16px 0;

        h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }
      }

      mat-list-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
      }

      .label {
        font-weight: 500;
        color: #666;
      }

      .value {
        color: #333;
        text-align: right;
        word-break: break-all;
      }

      .reference {
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }

      .entries-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }

      .entry-card {
        padding: 16px;
        border-radius: 8px;
        border: 2px solid #e0e0e0;

        &.debit {
          background-color: #ffebee;
          border-color: #f44336;
        }

        &.credit {
          background-color: #e8f5e9;
          border-color: #4caf50;
        }
      }

      .entry-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .entry-type {
        font-weight: 500;
        font-size: 14px;
      }

      .entry-amounts {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }

      .amount-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .amount-label {
        font-size: 13px;
        color: #666;
      }

      .amount-value {
        font-size: 16px;
        font-weight: 600;
      }

      .debit-amount {
        color: #f44336;
      }

      .credit-amount {
        color: #4caf50;
      }

      .entry-id {
        font-size: 11px;
        color: #999;
        font-family: 'Courier New', monospace;
      }

      .totals {
        padding: 16px;
        background-color: #f5f5f5;
        border-radius: 8px;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
      }

      .total-label {
        font-weight: 600;
        font-size: 14px;
        color: #333;
      }

      .total-value {
        font-size: 18px;
        font-weight: 700;
      }

      mat-dialog-actions {
        padding: 16px 24px;
      }
    `,
  ],
})
export class LedgerDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LedgerDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public transaction: LedgerTransaction
  ) {}

  getTotalDebits(): number {
    return this.transaction.entries.reduce(
      (sum, entry) => sum + entry.debitAmount,
      0
    );
  }

  getTotalCredits(): number {
    return this.transaction.entries.reduce(
      (sum, entry) => sum + entry.creditAmount,
      0
    );
  }
}
