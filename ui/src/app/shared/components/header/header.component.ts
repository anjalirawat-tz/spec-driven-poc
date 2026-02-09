import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TenantService } from '@core/services/tenant.service';

/**
 * HeaderComponent displays the application header with navigation and tenant info
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar color="primary" class="app-header">
      <span class="app-title">Accounting & Invoicing</span>

      <nav class="app-nav">
        <a
          mat-button
          routerLink="/accounts"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
        >
          <mat-icon>account_balance</mat-icon>
          Accounts
        </a>
        <a
          mat-button
          routerLink="/ledger"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
        >
          <mat-icon>receipt_long</mat-icon>
          Ledger
        </a>
        <a
          mat-button
          routerLink="/invoices"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
        >
          <mat-icon>description</mat-icon>
          Invoices
        </a>
      </nav>

      <span class="spacer"></span>

      <div class="tenant-info">
        <mat-icon>business</mat-icon>
        <span class="tenant-label">Tenant:</span>
        <span class="tenant-id">{{ tenantId }}</span>
      </div>
    </mat-toolbar>
  `,
  styles: [
    `
      .app-header {
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .app-title {
        font-size: 20px;
        font-weight: 500;
        margin-right: 32px;
      }

      .app-nav {
        display: flex;
        gap: 8px;
      }

      .app-nav a {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .app-nav a.active {
        background-color: rgba(255, 255, 255, 0.15);
      }

      .spacer {
        flex: 1;
      }

      .tenant-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        opacity: 0.9;
      }

      .tenant-label {
        font-weight: 500;
      }

      .tenant-id {
        font-family: 'Courier New', monospace;
        background-color: rgba(255, 255, 255, 0.15);
        padding: 4px 8px;
        border-radius: 4px;
      }
    `,
  ],
})
export class HeaderComponent {
  tenantId: string;

  constructor(private tenantService: TenantService) {
    this.tenantId = this.tenantService.getTenantId();
  }
}
