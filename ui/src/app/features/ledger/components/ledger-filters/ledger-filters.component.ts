import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { debounceTime, Subject } from 'rxjs';

import { TRANSACTION_TYPES, DEBOUNCE_TIME } from '@shared/constants';
import { LedgerFilters } from '@models/ledger-transaction.model';

/**
 * LedgerFiltersComponent provides filtering controls for ledger transactions
 */
@Component({
  selector: 'app-ledger-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="filters-container">
      <mat-form-field appearance="outline">
        <mat-label>Transaction Type</mat-label>
        <mat-select [(ngModel)]="filters.transactionType" (ngModelChange)="onFilterChange()">
          <mat-option [value]="''">All Types</mat-option>
          <mat-option *ngFor="let type of transactionTypes" [value]="type.value">
            {{ type.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Start Date</mat-label>
        <input
          matInput
          [matDatepicker]="startPicker"
          [(ngModel)]="startDate"
          (ngModelChange)="onDateChange()"
          placeholder="From date"
        />
        <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
        <mat-datepicker #startPicker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>End Date</mat-label>
        <input
          matInput
          [matDatepicker]="endPicker"
          [(ngModel)]="endDate"
          (ngModelChange)="onDateChange()"
          placeholder="To date"
        />
        <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
        <mat-datepicker #endPicker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Min Amount</mat-label>
        <input
          matInput
          type="number"
          [(ngModel)]="filters.minAmount"
          (ngModelChange)="onAmountChange($event, 'min')"
          placeholder="Min"
        />
        <span matPrefix>$&nbsp;</span>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Max Amount</mat-label>
        <input
          matInput
          type="number"
          [(ngModel)]="filters.maxAmount"
          (ngModelChange)="onAmountChange($event, 'max')"
          placeholder="Max"
        />
        <span matPrefix>$&nbsp;</span>
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

      mat-form-field {
        flex: 0 1 200px;
      }

      button[mat-raised-button] {
        margin-top: 8px;
      }
    `,
  ],
})
export class LedgerFiltersComponent {
  @Input() accountId?: string;
  @Output() filtersChange = new EventEmitter<LedgerFilters>();

  filters: LedgerFilters = {
    transactionType: undefined,
    minAmount: undefined,
    maxAmount: undefined,
  };

  startDate: Date | null = null;
  endDate: Date | null = null;

  transactionTypes = TRANSACTION_TYPES;

  private amountSubject = new Subject<void>();

  constructor() {
    // Debounce amount input to avoid excessive API calls
    this.amountSubject.pipe(debounceTime(DEBOUNCE_TIME)).subscribe(() => {
      this.onFilterChange();
    });
  }

  onDateChange(): void {
    if (this.startDate) {
      this.filters.startDate = this.startDate.toISOString().split('T')[0];
    } else {
      this.filters.startDate = undefined;
    }

    if (this.endDate) {
      this.filters.endDate = this.endDate.toISOString().split('T')[0];
    } else {
      this.filters.endDate = undefined;
    }

    this.onFilterChange();
  }

  onAmountChange(value: number | undefined, type: 'min' | 'max'): void {
    if (type === 'min') {
      this.filters.minAmount = value;
    } else {
      this.filters.maxAmount = value;
    }
    this.amountSubject.next();
  }

  onFilterChange(): void {
    const activeFilters: LedgerFilters = {};

    if (this.accountId) {
      activeFilters.accountId = this.accountId;
    }
    if (this.filters.transactionType) {
      activeFilters.transactionType = this.filters.transactionType;
    }
    if (this.filters.startDate) {
      activeFilters.startDate = this.filters.startDate;
    }
    if (this.filters.endDate) {
      activeFilters.endDate = this.filters.endDate;
    }
    if (this.filters.minAmount !== undefined) {
      activeFilters.minAmount = this.filters.minAmount;
    }
    if (this.filters.maxAmount !== undefined) {
      activeFilters.maxAmount = this.filters.maxAmount;
    }

    this.filtersChange.emit(activeFilters);
  }

  clearFilters(): void {
    this.filters = {
      transactionType: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    };
    this.startDate = null;
    this.endDate = null;
    this.onFilterChange();
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
