import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { AccountService } from '@core/services/account.service';
import { Account } from '@models/account.model';
import { AccountFiltersComponent, AccountFilters } from '../account-filters/account-filters.component';
import { AccountTableComponent } from '../account-table/account-table.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '@shared/components/error-alert/error-alert.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DEFAULT_PAGE_SIZE } from '@shared/constants';

/**
 * AccountListComponent displays a filterable, paginated list of accounts
 */
@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    AccountFiltersComponent,
    AccountTableComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="account-list-container">
      <h1>Accounts</h1>

      <app-account-filters
        (filtersChange)="onFiltersChange($event)"
      ></app-account-filters>

      <app-loading-spinner
        *ngIf="loading"
        [message]="'Loading accounts...'"
      ></app-loading-spinner>

      <app-error-alert
        *ngIf="error && !loading"
        [message]="error"
        [showRetry]="true"
        (retry)="loadAccounts()"
      ></app-error-alert>

      <app-empty-state
        *ngIf="!loading && !error && accounts.length === 0"
        [icon]="'account_balance'"
        [title]="'No Accounts Found'"
        [message]="hasActiveFilters() ? 'Try adjusting your filters' : 'No accounts have been created yet'"
      ></app-empty-state>

      <app-account-table
        *ngIf="!loading && !error && accounts.length > 0"
        [accounts]="accounts"
        [totalCount]="totalCount"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        (pageChange)="onPageChange($event)"
      ></app-account-table>
    </div>
  `,
  styles: [
    `
      .account-list-container {
        max-width: 1400px;
        margin: 0 auto;
      }

      h1 {
        margin: 0 0 24px 0;
        font-size: 32px;
        font-weight: 400;
        color: #333;
      }
    `,
  ],
})
export class AccountListComponent implements OnInit, OnDestroy {
  accounts: Account[] = [];
  totalCount = 0;
  pageSize = DEFAULT_PAGE_SIZE;
  pageIndex = 0;
  loading = false;
  error: string | null = null;

  private filters: AccountFilters = {};
  private destroy$ = new Subject<void>();

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;

    const params = {
      page: this.pageIndex + 1, // API uses 1-based pagination
      pageSize: this.pageSize,
      ...this.filters,
    };

    this.accountService
      .getAccounts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.accounts = response.accounts;
          this.totalCount = response.pagination.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading accounts:', err);
          this.error = err.error?.message || 'Failed to load accounts. Please try again.';
          this.loading = false;
        },
      });
  }

  onFiltersChange(filters: AccountFilters): void {
    this.filters = filters;
    this.pageIndex = 0; // Reset to first page when filters change
    this.loadAccounts();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAccounts();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.type || this.filters.status);
  }
}
