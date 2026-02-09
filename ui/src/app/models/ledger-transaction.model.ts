/**
 * Ledger Transaction Model - Double-entry bookkeeping transactions
 * Aligned with specs/master/contracts/accounting-api.yaml
 */

export interface LedgerTransaction {
  transactionId: string; // UUID
  tenantId: string; // UUID
  accountId: string; // UUID
  transactionType: TransactionType;
  idempotencyKey: string;
  description: string;
  referenceId?: string; // Ride ID or Payment Reference ID
  referenceType?: string; // "Ride" or "Payment"
  transactionDate: string; // ISO 8601 UTC
  createdAt: string; // ISO 8601 UTC
  createdBy: string;
  entries: LedgerEntry[];
}

export interface LedgerEntry {
  id: string; // UUID
  tenantId: string; // UUID
  ledgerTransactionId: string; // UUID
  accountType: LedgerAccountType;
  debitAmount: number; // decimal(18,2)
  creditAmount: number; // decimal(18,2)
}

export enum TransactionType {
  RideCharge = 'RideCharge',
  PaymentReceived = 'PaymentReceived',
}

export enum LedgerAccountType {
  AccountsReceivable = 'AccountsReceivable',
  ServiceRevenue = 'ServiceRevenue',
  Cash = 'Cash',
}

/**
 * Ledger transaction list response with pagination
 */
export interface LedgerTransactionListResponse {
  transactions: LedgerTransaction[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Ledger filters for transaction list queries
 */
export interface LedgerFilters {
  accountId?: string;
  startDate?: string; // ISO 8601 date
  endDate?: string; // ISO 8601 date
  transactionType?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
}
