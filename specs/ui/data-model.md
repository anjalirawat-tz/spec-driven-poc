# Data Model: Accounting & Invoicing UI

**Date**: 2026-02-09  
**Phase**: 1 - Component Architecture & Type Definitions  
**Status**: Complete

---

## Overview

This document defines the TypeScript interfaces, component architecture, and data flow for the Accounting & Invoicing UI. All types align with the backend API contract defined in `specs/master/contracts/accounting-api.yaml`.

---

## 1. Domain Model (TypeScript Interfaces)

### 1.1 Account

```typescript
/**
 * Account represents a financially responsible entity
 * (Organization or Individual)
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
```

### 1.2 Ledger Transaction

```typescript
/**
 * LedgerTransaction represents a double-entry transaction
 * with one or more ledger entries
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
```

### 1.3 Invoice

```typescript
/**
 * Invoice represents a billing document with line items
 * and payment tracking
 */
export interface Invoice {
  invoiceId: string; // UUID
  tenantId: string; // UUID
  accountId: string; // UUID
  invoiceNumber: string; // max 50 chars, unique
  frequency: InvoiceFrequency;
  billingPeriodStart: string; // ISO 8601 date
  billingPeriodEnd: string; // ISO 8601 date
  issueDate: string; // ISO 8601 date
  dueDate?: string; // ISO 8601 date
  status: InvoiceStatus;
  subtotal: number; // decimal(19,4)
  taxAmount: number; // decimal(19,4) - future
  totalAmount: number; // decimal(19,4)
  amountPaid: number; // decimal(19,4)
  outstandingAmount: number; // decimal(19,4)
  lineItems: InvoiceLineItem[];
  notes?: string; // max 1000 chars
  internalReference?: string; // max 100 chars
  billingContactName?: string; // max 200 chars
  billingContactEmail?: string; // max 100 chars
  createdAt: string; // ISO 8601 UTC
  createdBy: string;
  updatedAt?: string; // ISO 8601 UTC
  updatedBy?: string;
}

export interface InvoiceLineItem {
  lineItemId: string; // UUID
  invoiceId: string; // UUID
  rideId: string; // max 100 chars
  serviceDate: string; // ISO 8601 date
  description: string; // max 500 chars
  amount: number; // decimal(19,4)
  ledgerTransactionId: string; // UUID - links to ledger
}

export enum InvoiceFrequency {
  PerRide = 'PerRide',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Issued = 'Issued',
  Paid = 'Paid',
  Overdue = 'Overdue',
}
```

---

## 2. API Request/Response Types

### 2.1 Accounts API

```typescript
/**
 * GET /api/v1/accounts
 */
export interface ListAccountsRequest {
  page?: number; // default: 1
  pageSize?: number; // default: 50, max: 100
  accountType?: AccountType;
  status?: AccountStatus;
  search?: string; // search by name or account number
}

export interface ListAccountsResponse {
  accounts: Account[];
  pagination: PaginationMeta;
}

/**
 * GET /api/v1/accounts/{accountId}
 */
export type GetAccountResponse = Account;

/**
 * PATCH /api/v1/accounts/{accountId}
 */
export interface UpdateAccountRequest {
  name?: string;
  status?: AccountStatus;
}

export type UpdateAccountResponse = Account;
```

### 2.2 Ledger API

```typescript
/**
 * GET /api/v1/ledger/transactions
 */
export interface ListLedgerTransactionsRequest {
  accountId: string; // Required
  from?: string; // ISO 8601 date
  to?: string; // ISO 8601 date
  transactionType?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

export interface ListLedgerTransactionsResponse {
  transactions: LedgerTransaction[];
  pagination: PaginationMeta;
}

/**
 * GET /api/v1/ledger/transactions/{transactionId}
 */
export type GetLedgerTransactionResponse = LedgerTransaction;
```

### 2.3 Invoices API

```typescript
/**
 * GET /api/v1/invoices
 */
export interface ListInvoicesRequest {
  accountId: string; // Required
  frequency?: InvoiceFrequency;
  status?: InvoiceStatus;
  from?: string; // ISO 8601 date (issueDate)
  to?: string; // ISO 8601 date
  page?: number;
  pageSize?: number;
}

export interface ListInvoicesResponse {
  invoices: Invoice[];
  pagination: PaginationMeta;
}

/**
 * GET /api/v1/invoices/{invoiceId}
 */
export type GetInvoiceResponse = Invoice;

/**
 * PATCH /api/v1/invoices/{invoiceId}
 */
export interface UpdateInvoiceMetadataRequest {
  notes?: string; // max 1000 chars
  internalReference?: string; // max 100 chars
  billingContactName?: string; // max 200 chars
  billingContactEmail?: string; // email format
}

export type UpdateInvoiceMetadataResponse = Invoice;

/**
 * GET /api/v1/invoices/{invoiceId}/pdf
 */
// Returns binary PDF data with Content-Type: application/pdf
```

### 2.4 Common Types

```typescript
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}
```

---

## 3. Component Architecture

### 3.1 Page Components (Routes)

```
/                           → AccountListPage
/accounts/:accountId        → AccountDetailPage (with tabs)
  ├─ /accounts/:accountId/summary       → AccountSummaryTab
  ├─ /accounts/:accountId/transactions  → AccountTransactionsTab
  └─ /accounts/:accountId/invoices      → AccountInvoicesTab
/invoices/:invoiceId        → InvoiceDetailPage
/404                        → NotFoundPage
```

### 3.2 Component Hierarchy

```
App
├── TenantProvider (Context)
│   └── QueryClientProvider (React Query)
│       └── Router
│           ├── Layout (App shell with header, nav)
│           │   ├── Header (tenant display, user menu)
│           │   └── Main (route outlet)
│           │       ├── AccountListPage
│           │       │   ├── AccountListFilters (search, type, status)
│           │       │   └── AccountTable (MUI DataGrid)
│           │       │       └── AccountRow (clickable)
│           │       ├── AccountDetailPage
│           │       │   ├── AccountHeader (name, number, balance)
│           │       │   └── Tabs (Summary, Transactions, Invoices)
│           │       │       ├── AccountSummaryTab
│           │       │       │   ├── AccountMetadata
│           │       │       │   └── AccountStats (totals, last activity)
│           │       │       ├── AccountTransactionsTab
│           │       │       │   ├── LedgerFilters (date, type, amount)
│           │       │       │   └── LedgerTable (MUI DataGrid)
│           │       │       │       └── LedgerRow
│           │       │       │           └── LedgerDetailModal
│           │       │       └── AccountInvoicesTab
│           │       │           ├── InvoiceFilters (frequency, status, date)
│           │       │           └── InvoiceTable (MUI DataGrid)
│           │       │               └── InvoiceRow (clickable)
│           │       └── InvoiceDetailPage
│           │           ├── InvoiceHeader (number, status, dates)
│           │           ├── InvoiceMetadata (editable form)
│           │           ├── InvoiceLineItemsTable
│           │           ├── InvoiceSummary (totals, payments, outstanding)
│           │           └── InvoiceActions (download PDF, view transactions)
│           └── NotFoundPage
```

### 3.3 Reusable Components

```typescript
// Common components used across the app
- DataTable (wrapper around MUI DataGrid with common config)
- DateRangePicker (from/to date inputs)
- CurrencyDisplay (formatted USD amount)
- StatusBadge (colored badge for account/invoice status)
- LoadingSpinner (full-page or inline loading state)
- ErrorAlert (user-friendly error display)
- ConfirmDialog (confirmation modals)
- EmptyState (no data placeholder)
```

---

## 4. Custom Hooks (React Query)

### 4.1 Account Hooks

```typescript
/**
 * Fetch paginated list of accounts
 */
export function useAccounts(params: ListAccountsRequest) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => accountsApi.listAccounts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch single account by ID
 */
export function useAccount(accountId: string) {
  return useQuery({
    queryKey: ['accounts', accountId],
    queryFn: () => accountsApi.getAccount(accountId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update account mutation
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, data }: { accountId: string; data: UpdateAccountRequest }) =>
      accountsApi.updateAccount(accountId, data),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.setQueryData(['accounts', account.id], account);
    },
  });
}
```

### 4.2 Ledger Hooks

```typescript
/**
 * Fetch ledger transactions for an account
 */
export function useLedgerTransactions(params: ListLedgerTransactionsRequest) {
  return useQuery({
    queryKey: ['ledger', 'transactions', params],
    queryFn: () => ledgerApi.listTransactions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!params.accountId, // Only fetch if accountId is provided
  });
}

/**
 * Fetch single ledger transaction by ID
 */
export function useLedgerTransaction(transactionId: string) {
  return useQuery({
    queryKey: ['ledger', 'transactions', transactionId],
    queryFn: () => ledgerApi.getTransaction(transactionId),
    staleTime: 5 * 60 * 1000,
  });
}
```

### 4.3 Invoice Hooks

```typescript
/**
 * Fetch invoices for an account
 */
export function useInvoices(params: ListInvoicesRequest) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.listInvoices(params),
    staleTime: 5 * 60 * 1000,
    enabled: !!params.accountId,
  });
}

/**
 * Fetch single invoice by ID
 */
export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: () => invoicesApi.getInvoice(invoiceId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update invoice metadata mutation
 */
export function useUpdateInvoiceMetadata() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: UpdateInvoiceMetadataRequest }) =>
      invoicesApi.updateInvoiceMetadata(invoiceId, data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.setQueryData(['invoices', invoice.invoiceId], invoice);
    },
  });
}

/**
 * Download invoice PDF
 */
export function useDownloadInvoicePDF() {
  return useMutation({
    mutationFn: (invoiceId: string) => invoicesApi.downloadInvoicePDF(invoiceId),
    onSuccess: (blob, invoiceId) => {
      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
}
```

---

## 5. API Client Implementation

### 5.1 Base Client (Axios)

```typescript
// src/api/client.ts
import axios, { AxiosInstance } from 'axios';
import { getTenantId } from '../context/TenantContext';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Add tenant header
    this.client.interceptors.request.use(
      (config) => {
        const tenantId = getTenantId();
        if (tenantId) {
          config.headers['X-Tenant-ID'] = tenantId;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login or refresh token
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, params?: Record<string, unknown>) {
    return this.client.get<T>(url, { params }).then((res) => res.data);
  }

  post<T>(url: string, data?: Record<string, unknown>) {
    return this.client.post<T>(url, data).then((res) => res.data);
  }

  patch<T>(url: string, data?: Record<string, unknown>) {
    return this.client.patch<T>(url, data).then((res) => res.data);
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url).then((res) => res.data);
  }

  getBlob(url: string) {
    return this.client.get(url, { responseType: 'blob' }).then((res) => res.data);
  }
}

export const apiClient = new ApiClient();
```

### 5.2 Accounts API

```typescript
// src/api/accounts.ts
import { apiClient } from './client';
import type {
  Account,
  ListAccountsRequest,
  ListAccountsResponse,
  UpdateAccountRequest,
} from '../models';

export const accountsApi = {
  listAccounts: (params: ListAccountsRequest): Promise<ListAccountsResponse> =>
    apiClient.get('/accounts', params),

  getAccount: (accountId: string): Promise<Account> =>
    apiClient.get(`/accounts/${accountId}`),

  updateAccount: (accountId: string, data: UpdateAccountRequest): Promise<Account> =>
    apiClient.patch(`/accounts/${accountId}`, data),
};
```

### 5.3 Ledger API

```typescript
// src/api/ledger.ts
import { apiClient } from './client';
import type {
  LedgerTransaction,
  ListLedgerTransactionsRequest,
  ListLedgerTransactionsResponse,
} from '../models';

export const ledgerApi = {
  listTransactions: (params: ListLedgerTransactionsRequest): Promise<ListLedgerTransactionsResponse> =>
    apiClient.get('/ledger/transactions', params),

  getTransaction: (transactionId: string): Promise<LedgerTransaction> =>
    apiClient.get(`/ledger/transactions/${transactionId}`),
};
```

### 5.4 Invoices API

```typescript
// src/api/invoices.ts
import { apiClient } from './client';
import type {
  Invoice,
  ListInvoicesRequest,
  ListInvoicesResponse,
  UpdateInvoiceMetadataRequest,
} from '../models';

export const invoicesApi = {
  listInvoices: (params: ListInvoicesRequest): Promise<ListInvoicesResponse> =>
    apiClient.get('/invoices', params),

  getInvoice: (invoiceId: string): Promise<Invoice> =>
    apiClient.get(`/invoices/${invoiceId}`),

  updateInvoiceMetadata: (invoiceId: string, data: UpdateInvoiceMetadataRequest): Promise<Invoice> =>
    apiClient.patch(`/invoices/${invoiceId}`, data),

  downloadInvoicePDF: (invoiceId: string): Promise<Blob> =>
    apiClient.getBlob(`/invoices/${invoiceId}/pdf`),
};
```

---

## 6. Utility Functions

### 6.1 Formatters

```typescript
// src/utils/formatters.ts
import { format, parseISO } from 'date-fns';

/**
 * Format currency amount in USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format ISO 8601 date to human-readable format
 */
export function formatDate(isoDate: string, formatStr: string = 'MMM d, yyyy'): string {
  return format(parseISO(isoDate), formatStr);
}

/**
 * Format ISO 8601 datetime to human-readable format
 */
export function formatDateTime(isoDateTime: string): string {
  return format(parseISO(isoDateTime), 'MMM d, yyyy h:mm a');
}

/**
 * Format date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}
```

### 6.2 Validators

```typescript
// src/utils/validators.ts

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required field
 */
export function isRequired(value: string | null | undefined): boolean {
  return !!value && value.trim().length > 0;
}

/**
 * Validate max length
 */
export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}
```

---

## 7. State Management

### 7.1 Tenant Context

```typescript
// src/context/TenantContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface TenantContextType {
  tenantId: string;
  tenantName: string;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  // In real implementation, extract from JWT or auth service
  const tenantId = extractTenantIdFromJWT();
  const tenantName = extractTenantNameFromJWT();

  return (
    <TenantContext.Provider value={{ tenantId, tenantName }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

export function getTenantId(): string | null {
  // Utility for API client to access tenant ID
  // In real implementation, read from localStorage, sessionStorage, or JWT
  return localStorage.getItem('tenantId');
}

function extractTenantIdFromJWT(): string {
  // Placeholder - real implementation would decode JWT
  return 'tenant-123';
}

function extractTenantNameFromJWT(): string {
  // Placeholder
  return 'Example Tenant';
}
```

---

## 8. Routing Configuration

```typescript
// src/routes.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AccountListPage from './pages/AccountListPage';
import AccountDetailPage from './pages/AccountDetailPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/accounts" replace />,
      },
      {
        path: 'accounts',
        element: <AccountListPage />,
      },
      {
        path: 'accounts/:accountId/*',
        element: <AccountDetailPage />,
      },
      {
        path: 'invoices/:invoiceId',
        element: <InvoiceDetailPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
```

---

## 9. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     User Interaction                          │
│                (Click, Filter, Submit Form)                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                   React Component                             │
│          (AccountListPage, InvoiceDetailPage, etc.)           │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│               Custom Hook (React Query)                       │
│        (useAccounts, useLedger, useInvoices, etc.)           │
│                                                               │
│   - Caching (staleTime: 2-5 minutes)                         │
│   - Refetching on window focus                               │
│   - Automatic retry on failure                               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    API Client (Axios)                         │
│                                                               │
│   Request Interceptor:                                        │
│   - Add X-Tenant-ID header                                   │
│   - Add Authorization header                                 │
│                                                               │
│   Response Interceptor:                                       │
│   - Handle 401 (redirect to login)                           │
│   - Parse error responses                                    │
└──────────────────────────────────────────────────────────────┘
                            ↓
                    HTTPS REST API
                            ↓
┌──────────────────────────────────────────────────────────────┐
│            Accounting Service Backend API                     │
│         (Returns JSON with Account, Ledger, Invoice data)    │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Error Handling Strategy

### Component-Level Errors

```typescript
// Use React Query's error handling
const { data, error, isLoading } = useAccounts({ page: 1 });

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorAlert message="Failed to load accounts" error={error} />;
return <AccountTable accounts={data.accounts} />;
```

### Global Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## Conclusion

The data model and component architecture provide:

✅ **Type Safety**: TypeScript interfaces for all API contracts  
✅ **Separation of Concerns**: API layer, hooks layer, component layer  
✅ **Reusability**: Custom hooks abstract data fetching logic  
✅ **Performance**: React Query caching reduces API calls  
✅ **Maintainability**: Clear component hierarchy and data flow  

The architecture is scalable and can accommodate P2 features (invoice metadata editing, cross-linking) without major refactoring.

**Next Phase**: Generate contracts/ (TypeScript types from OpenAPI spec) and quickstart.md
