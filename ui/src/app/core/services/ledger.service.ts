import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  LedgerTransaction,
  LedgerTransactionListResponse,
  LedgerFilters,
} from '@models/ledger-transaction.model';

/**
 * LedgerService handles all ledger transaction-related API operations
 */
@Injectable({
  providedIn: 'root',
})
export class LedgerService {
  private readonly apiUrl = `${environment.apiUrl}/ledger/transactions`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of ledger transactions with optional filters
   * @param params Query parameters (page, pageSize, accountId, startDate, endDate, transactionType, etc.)
   */
  getLedgerTransactions(params?: {
    page?: number;
    pageSize?: number;
    accountId?: string;
    startDate?: string;
    endDate?: string;
    transactionType?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Observable<LedgerTransactionListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.pageSize !== undefined) {
        httpParams = httpParams.set('pageSize', params.pageSize.toString());
      }
      if (params.accountId) {
        httpParams = httpParams.set('accountId', params.accountId);
      }
      if (params.startDate) {
        httpParams = httpParams.set('startDate', params.startDate);
      }
      if (params.endDate) {
        httpParams = httpParams.set('endDate', params.endDate);
      }
      if (params.transactionType) {
        httpParams = httpParams.set('transactionType', params.transactionType);
      }
      if (params.minAmount !== undefined) {
        httpParams = httpParams.set('minAmount', params.minAmount.toString());
      }
      if (params.maxAmount !== undefined) {
        httpParams = httpParams.set('maxAmount', params.maxAmount.toString());
      }
    }

    return this.http.get<LedgerTransactionListResponse>(this.apiUrl, {
      params: httpParams,
    });
  }

  /**
   * Get a single ledger transaction by ID
   * @param transactionId - The transaction ID (UUID)
   */
  getLedgerTransactionById(transactionId: string): Observable<LedgerTransaction> {
    return this.http.get<LedgerTransaction>(`${this.apiUrl}/${transactionId}`);
  }
}
