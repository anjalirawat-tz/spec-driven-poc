/**
 * Account Model - Represents a financially responsible entity
 * Aligned with specs/master/contracts/accounting-api.yaml
 */

export interface Account {
  id: string; // UUID
  tenantId: string; // UUID
  accountNumber: string; // max 50 chars
  name: string; // max 200 chars
  type: AccountType;
  status: AccountStatus;
  currencyCode: string; // Fixed: "USD"
  currentBalance: number; // Computed from ledger
  createdAt: string; // ISO 8601 UTC
  createdBy: string; // max 100 chars
  updatedAt?: string; // ISO 8601 UTC
}

export enum AccountType {
  Organization = 'Organization',
  Individual = 'Individual',
}

export enum AccountStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

/**
 * Account list response with pagination
 */
export interface AccountListResponse {
  accounts: Account[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Account update request (metadata only)
 */
export interface UpdateAccountRequest {
  name?: string;
  status?: AccountStatus;
}
