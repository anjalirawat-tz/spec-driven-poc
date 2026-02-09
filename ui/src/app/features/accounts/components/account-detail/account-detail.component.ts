import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { AccountService } from '@core/services/account.service';
import { Account } from '@models/account.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '@shared/components/error-alert/error-alert.component';
import { AccountHeaderComponent } from '../account-header/account-header.component';
import { AccountSummaryComponent } from '../account-summary/account-summary.component';
import { AccountStatsComponent } from '../account-stats/account-stats.component';
import { AccountTransactionsComponent } from '../account-transactions/account-transactions.component';

/**
 * AccountDetailComponent displays detailed information about an account
 * with tabs for Summary, Transactions, and Invoices
 */
@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    AccountHeaderComponent,
    AccountSummaryComponent,
    AccountStatsComponent,
    AccountTransactionsComponent,
  ],
  template: `
    <div class="account-detail-container">
      <div class="breadcrumb">
        <button mat-button routerLink="/accounts">
          <mat-icon>arrow_back</mat-icon>
          Back to Accounts
        </button>
      </div>

      <app-loading-spinner
        *ngIf="loading"
        [message]="'Loading account details...'"
      ></app-loading-spinner>

      <app-error-alert
        *ngIf="error && !loading"
        [message]="error"
        [showRetry]="true"
        (retry)="loadAccount()"
      ></app-error-alert>

      <div *ngIf="account && !loading && !error">
        <app-account-header [account]="account"></app-account-header>

        <mat-tab-group class="account-tabs" (selectedIndexChange)="onTabChange($event)">
          <mat-tab label="Summary">
            <div class="tab-content">
              <div class="summary-grid">
                <app-account-summary [account]="account"></app-account-summary>
                <app-account-stats [account]="account"></app-account-stats>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Transactions">
            <div class="tab-content">
              <app-account-transactions [accountId]="account.id"></app-account-transactions>
            </div>
          </mat-tab>

          <mat-tab label="Invoices">
            <div class="tab-content">
              <p class="placeholder-text">
                <mat-icon>description</mat-icon>
                Invoices will be displayed here (Phase 5)
              </p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [
    `
      .account-detail-container {
        max-width: 1400px;
        margin: 0 auto;
      }

      .breadcrumb {
        margin-bottom: 16px;
      }

      .account-tabs {
        margin-top: 24px;
      }

      .tab-content {
        padding: 24px 0;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;

        @media (max-width: 960px) {
          grid-template-columns: 1fr;
        }
      }

      .placeholder-text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 48px;
        color: #999;
        font-size: 16px;
        text-align: center;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }
      }
    `,
  ],
})
export class AccountDetailComponent implements OnInit, OnDestroy {
  account: Account | null = null;
  loading = false;
  error: string | null = null;

  private accountId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.accountId = params['id'];
      if (this.accountId) {
        this.loadAccount();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAccount(): void {
    this.loading = true;
    this.error = null;

    this.accountService
      .getAccountById(this.accountId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (account) => {
          this.account = account;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading account:', err);
          this.error =
            err.error?.message || 'Failed to load account. Please try again.';
          this.loading = false;
        },
      });
  }

  onTabChange(index: number): void {
    // Could be used to lazy-load tab content in the future
    console.log('Tab changed to index:', index);
  }
}
