import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { LedgerService } from '@core/services/ledger.service';
import { LedgerTransaction, LedgerFilters } from '@models/ledger-transaction.model';
import { LedgerFiltersComponent } from '../../../ledger/components/ledger-filters/ledger-filters.component';
import { LedgerTableComponent } from '../../../ledger/components/ledger-table/ledger-table.component';
import { LedgerDetailDialogComponent } from '../../../ledger/components/ledger-detail-dialog/ledger-detail-dialog.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '@shared/components/error-alert/error-alert.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DEFAULT_PAGE_SIZE } from '@shared/constants';

/**
 * AccountTransactionsComponent displays ledger transactions for a specific account
 */
@Component({
  selector: 'app-account-transactions',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    LedgerFiltersComponent,
    LedgerTableComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="account-transactions-container">
      <app-ledger-filters
        [accountId]="accountId"
        (filtersChange)="onFiltersChange($event)"
      ></app-ledger-filters>

      <app-loading-spinner
        *ngIf="loading"
        [message]="'Loading transactions...'"
      ></app-loading-spinner>

      <app-error-alert
        *ngIf="error && !loading"
        [message]="error"
        [showRetry]="true"
        (retry)="loadTransactions()"
      ></app-error-alert>

      <app-empty-state
        *ngIf="!loading && !error && transactions.length === 0"
        [icon]="'receipt_long'"
        [title]="'No Transactions Found'"
        [message]="hasActiveFilters() ? 'Try adjusting your filters' : 'No transactions have been recorded for this account yet'"
      ></app-empty-state>

      <app-ledger-table
        *ngIf="!loading && !error && transactions.length > 0"
        [transactions]="transactions"
        [showRunningBalance]="true"
        [totalCount]="totalCount"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        (pageChange)="onPageChange($event)"
        (transactionClick)="onTransactionClick($event)"
      ></app-ledger-table>
    </div>
  `,
  styles: [
    `
      .account-transactions-container {
        padding: 24px 0;
      }
    `,
  ],
})
export class AccountTransactionsComponent implements OnInit, OnDestroy {
  @Input() accountId!: string;

  transactions: LedgerTransaction[] = [];
  totalCount = 0;
  pageSize = DEFAULT_PAGE_SIZE;
  pageIndex = 0;
  loading = false;
  error: string | null = null;

  private filters: LedgerFilters = {};
  private destroy$ = new Subject<void>();

  constructor(
    private ledgerService: LedgerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.accountId) {
      this.filters.accountId = this.accountId;
      this.loadTransactions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;

    const params = {
      page: this.pageIndex + 1, // API uses 1-based pagination
      pageSize: this.pageSize,
      ...this.filters,
    };

    this.ledgerService
      .getLedgerTransactions(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.transactions = response.transactions;
          this.totalCount = response.pagination.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading transactions:', err);
          this.error =
            err.error?.message || 'Failed to load transactions. Please try again.';
          this.loading = false;
        },
      });
  }

  onFiltersChange(filters: LedgerFilters): void {
    this.filters = { ...filters, accountId: this.accountId };
    this.pageIndex = 0; // Reset to first page when filters change
    this.loadTransactions();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  onTransactionClick(transaction: LedgerTransaction): void {
    this.dialog.open(LedgerDetailDialogComponent, {
      width: '700px',
      data: transaction,
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.transactionType ||
      this.filters.startDate ||
      this.filters.endDate ||
      this.filters.minAmount !== undefined ||
      this.filters.maxAmount !== undefined
    );
  }
}
