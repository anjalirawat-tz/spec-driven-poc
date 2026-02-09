import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  Account,
  AccountListResponse,
  UpdateAccountRequest,
} from '@models/account.model';

/**
 * AccountService handles all account-related API operations
 */
@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly apiUrl = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of accounts with optional filters
   * @param params Query parameters (page, pageSize, type, status, search)
   */
  getAccounts(params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    search?: string;
  }): Observable<AccountListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.pageSize !== undefined) {
        httpParams = httpParams.set('pageSize', params.pageSize.toString());
      }
      if (params.type) {
        httpParams = httpParams.set('type', params.type);
      }
      if (params.status) {
        httpParams = httpParams.set('status', params.status);
      }
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
    }

    return this.http.get<AccountListResponse>(this.apiUrl, {
      params: httpParams,
    });
  }

  /**
   * Get a single account by ID
   * @param accountId - The account ID (UUID)
   */
  getAccountById(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${accountId}`);
  }

  /**
   * Update account metadata (name, status)
   * @param accountId - The account ID (UUID)
   * @param request - The update request payload
   */
  updateAccount(
    accountId: string,
    request: UpdateAccountRequest
  ): Observable<Account> {
    return this.http.patch<Account>(`${this.apiUrl}/${accountId}`, request);
  }
}
