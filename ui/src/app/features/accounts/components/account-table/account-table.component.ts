import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Account } from '@models/account.model';
import { CurrencyFormatPipe } from '@shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

/**
 * AccountTableComponent displays accounts in a Material table
 * with sorting, pagination, and row selection
 */
@Component({
  selector: 'app-account-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CurrencyFormatPipe,
    DateFormatPipe,
    StatusBadgeComponent,
  ],
  templateUrl: './account-table.component.html',
  styleUrls: ['./account-table.component.scss'],
})
export class AccountTableComponent implements AfterViewInit {
  @Input() set accounts(value: Account[]) {
    this.dataSource.data = value;
  }

  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;

  @Output() pageChange = new EventEmitter<{
    pageIndex: number;
    pageSize: number;
  }>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Account>([]);

  displayedColumns: string[] = [
    'accountNumber',
    'name',
    'type',
    'status',
    'currentBalance',
    'createdAt',
    'actions',
  ];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageChange.emit(event);
  }
}
