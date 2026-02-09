import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { Account } from '@models/account.model';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';

/**
 * AccountSummaryComponent displays account metadata and details
 */
@Component({
  selector: 'app-account-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    DateFormatPipe,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Account Information</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <mat-list-item>
            <span class="label">Tenant ID:</span>
            <span class="value">{{ account.tenantId }}</span>
          </mat-list-item>
          <mat-divider></mat-divider>

          <mat-list-item>
            <span class="label">Account ID:</span>
            <span class="value">{{ account.id }}</span>
          </mat-list-item>
          <mat-divider></mat-divider>

          <mat-list-item>
            <span class="label">Currency:</span>
            <span class="value">{{ account.currencyCode }}</span>
          </mat-list-item>
          <mat-divider></mat-divider>

          <mat-list-item>
            <span class="label">Created Date:</span>
            <span class="value">{{ account.createdAt | dateFormat:'MMM d, yyyy h:mm a' }}</span>
          </mat-list-item>
          <mat-divider></mat-divider>

          <mat-list-item>
            <span class="label">Created By:</span>
            <span class="value">{{ account.createdBy }}</span>
          </mat-list-item>

          <mat-divider *ngIf="account.updatedAt"></mat-divider>
          <mat-list-item *ngIf="account.updatedAt">
            <span class="label">Last Updated:</span>
            <span class="value">{{ account.updatedAt | dateFormat:'MMM d, yyyy h:mm a' }}</span>
          </mat-list-item>
        </mat-list>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      mat-card {
        height: 100%;
      }

      mat-list-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
      }

      .label {
        font-weight: 500;
        color: #666;
      }

      .value {
        color: #333;
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }
    `,
  ],
})
export class AccountSummaryComponent {
  @Input() account!: Account;
}
