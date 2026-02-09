import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, Subject } from 'rxjs';

import { ACCOUNT_TYPES, ACCOUNT_STATUSES, DEBOUNCE_TIME } from '@shared/constants';

export interface AccountFilters {
  search?: string;
  type?: string;
  status?: string;
}

/**
 * AccountFiltersComponent provides filtering controls for the account list
 */
@Component({
  selector: 'app-account-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="filters-container">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search accounts</mat-label>
        <input
          matInput
          [(ngModel)]="filters.search"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Search by name or account number"
        />
        <mat-icon matPrefix>search</mat-icon>
        <button
          *ngIf="filters.search"
          matSuffix
          mat-icon-button
          (click)="clearSearch()"
          aria-label="Clear search"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Account Type</mat-label>
        <mat-select [(ngModel)]="filters.type" (ngModelChange)="onFilterChange()">
          <mat-option [value]="''">All Types</mat-option>
          <mat-option *ngFor="let type of accountTypes" [value]="type.value">
            {{ type.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="filters.status" (ngModelChange)="onFilterChange()">
          <mat-option [value]="''">All Statuses</mat-option>
          <mat-option *ngFor="let status of accountStatuses" [value]="status.value">
            {{ status.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <button
        mat-raised-button
        (click)="clearFilters()"
        [disabled]="!hasActiveFilters()"
      >
        <mat-icon>clear</mat-icon>
        Clear Filters
      </button>
    </div>
  `,
  styles: [
    `
      .filters-container {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        padding: 16px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
        flex-wrap: wrap;
      }

      .search-field {
        flex: 1;
        min-width: 300px;
      }

      mat-form-field {
        flex: 0 1 200px;
      }

      button[mat-raised-button] {
        margin-top: 8px;
      }
    `,
  ],
})
export class AccountFiltersComponent {
  @Output() filtersChange = new EventEmitter<AccountFilters>();

  filters: AccountFilters = {
    search: '',
    type: '',
    status: '',
  };

  accountTypes = ACCOUNT_TYPES;
  accountStatuses = ACCOUNT_STATUSES;

  private searchSubject = new Subject<string>();

  constructor() {
    // Debounce search input to avoid excessive API calls
    this.searchSubject.pipe(debounceTime(DEBOUNCE_TIME)).subscribe((search) => {
      this.filters.search = search;
      this.onFilterChange();
    });
  }

  onSearchChange(search: string): void {
    this.searchSubject.next(search);
  }

  onFilterChange(): void {
    const activeFilters: AccountFilters = {};

    if (this.filters.search) {
      activeFilters.search = this.filters.search;
    }
    if (this.filters.type) {
      activeFilters.type = this.filters.type;
    }
    if (this.filters.status) {
      activeFilters.status = this.filters.status;
    }

    this.filtersChange.emit(activeFilters);
  }

  clearSearch(): void {
    this.filters.search = '';
    this.onFilterChange();
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      type: '',
      status: '',
    };
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.type || this.filters.status);
  }
}
