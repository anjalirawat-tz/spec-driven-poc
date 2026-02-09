/**
 * Invoice Model - Billing documents with line items and payment tracking
 * Aligned with specs/master/contracts/accounting-api.yaml
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

/**
 * Invoice list response with pagination
 */
export interface InvoiceListResponse {
  invoices: Invoice[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Invoice filters for list queries
 */
export interface InvoiceFilters {
  accountId?: string;
  frequency?: InvoiceFrequency;
  status?: InvoiceStatus;
  startDate?: string; // ISO 8601 date
  endDate?: string; // ISO 8601 date
}

/**
 * Invoice metadata update request (non-financial fields only)
 */
export interface UpdateInvoiceMetadataRequest {
  notes?: string;
  internalReference?: string;
  billingContactName?: string;
  billingContactEmail?: string;
}
