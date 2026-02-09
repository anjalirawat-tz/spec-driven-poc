import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LedgerTransaction } from '@models/ledger-transaction.model';
import { CurrencyFormatPipe } from '@shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

interface LedgerTransactionWithBalance extends LedgerTransaction {
  runningBalance?: number;
}

/**
 * LedgerTableComponent displays ledger transactions in a table with running balance
 */
@Component({
  selector: 'app-ledger-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CurrencyFormatPipe,
    DateFormatPipe,
    StatusBadgeComponent,
  ],
  templateUrl: './ledger-table.component.html',
  styleUrls: ['./ledger-table.component.scss'],
})
export class LedgerTableComponent implements OnChanges {
  @Input() transactions: LedgerTransaction[] = [];
  @Input() showRunningBalance = true;
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;

  @Output() pageChange = new EventEmitter<{
    pageIndex: number;
    pageSize: number;
  }>();
  @Output() transactionClick = new EventEmitter<LedgerTransaction>();

  transactionsWithBalance: LedgerTransactionWithBalance[] = [];

  displayedColumns: string[] = [
    'transactionDate',
    'transactionType',
    'description',
    'debit',
    'credit',
    'runningBalance',
    'actions',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions'] || changes['showRunningBalance']) {
      this.calculateRunningBalances();
    }
  }

  calculateRunningBalances(): void {
    this.transactionsWithBalance = [...this.transactions];

    if (this.showRunningBalance) {
      let runningBalance = 0;

      // Calculate running balance for each transaction
      this.transactionsWithBalance = this.transactionsWithBalance.map((tx) => {
        const debitAmount = this.getTotalDebit(tx);
        const creditAmount = this.getTotalCredit(tx);

        // For Accounts Receivable: Debit increases balance, Credit decreases balance
        runningBalance += debitAmount - creditAmount;

        return {
          ...tx,
          runningBalance,
        };
      });
    }
  }

  getTotalDebit(transaction: LedgerTransaction): number {
    return transaction.entries.reduce(
      (sum, entry) => sum + entry.debitAmount,
      0
    );
  }

  getTotalCredit(transaction: LedgerTransaction): number {
    return transaction.entries.reduce(
      (sum, entry) => sum + entry.creditAmount,
      0
    );
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageChange.emit(event);
  }

  onTransactionClick(transaction: LedgerTransaction): void {
    this.transactionClick.emit(transaction);
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'RideCharge':
        return 'local_taxi';
      case 'PaymentReceived':
        return 'payment';
      default:
        return 'receipt_long';
    }
  }
}
