# API Contracts (TypeScript)

**Date**: 2026-02-09  
**Backend API**: Accounting Service REST API  
**Backend API Spec**: `specs/master/contracts/accounting-api.yaml`

---

## Overview

This directory contains TypeScript type definitions for the Accounting Service API. These types ensure type safety between the UI and backend API.

---

## Type Generation

Types can be generated from the OpenAPI spec using tools like:
- `openapi-typescript`: Generates TypeScript types from OpenAPI schemas
- `@hey-api/openapi-ts`: Alternative OpenAPI code generator

### Recommended Approach

```bash
# Install openapi-typescript
npm install --save-dev openapi-typescript

# Generate types from backend API spec
npx openapi-typescript ../master/contracts/accounting-api.yaml -o ./generated-types.ts
```

This will generate strongly-typed interfaces that match the backend API exactly.

---

## Manual Type Definitions

For rapid development or when OpenAPI spec is unavailable, types are manually defined in `src/models/` directory of the UI project. See `specs/ui/data-model.md` for complete type definitions.

---

## API Contract Reference

The UI interacts with the following backend endpoints:

### Accounts
- `GET /api/v1/accounts` - List accounts with pagination
- `GET /api/v1/accounts/{accountId}` - Get account details
- `PATCH /api/v1/accounts/{accountId}` - Update account metadata

### Ledger Transactions
- `GET /api/v1/ledger/transactions?accountId={id}` - List transactions
- `GET /api/v1/ledger/transactions/{transactionId}` - Get transaction details

### Invoices
- `GET /api/v1/invoices?accountId={id}` - List invoices
- `GET /api/v1/invoices/{invoiceId}` - Get invoice details
- `PATCH /api/v1/invoices/{invoiceId}` - Update invoice metadata
- `GET /api/v1/invoices/{invoiceId}/pdf` - Download PDF

---

## Contract Testing

When integrating with the backend API, ensure:
1. **TypeScript interfaces match API responses** (use generated types if possible)
2. **Integration tests verify API contract** (use MSW for mocking)
3. **Version compatibility** (track backend API version)

---

## Type Examples

See full type definitions in `data-model.md`. Key interfaces:

```typescript
// Account
interface Account {
  id: string;
  accountNumber: string;
  name: string;
  type: 'Organization' | 'Individual';
  status: 'Active' | 'Inactive';
  currentBalance: number;
  createdAt: string;
}

// Ledger Transaction
interface LedgerTransaction {
  transactionId: string;
  accountId: string;
  trans actionType: 'RideCharge' | 'PaymentReceived';
  transactionDate: string;
  entries: LedgerEntry[];
}

// Invoice
interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  accountId: string;
  frequency: 'PerRide' | 'Daily' | 'Weekly' | 'Monthly';
  totalAmount: number;
  outstandingAmount: number;
  lineItems: InvoiceLineItem[];
}
```

---

## Headers

All API requests must include:

```typescript
{
  'X-Tenant-ID': '<tenant-uuid>',  // Required for multi-tenancy
  'Authorization': 'Bearer <jwt>',  // Required for authentication
  'Content-Type': 'application/json'
}
```

Tenant ID is automatically injected by the Axios interceptor (see `src/api/client.ts`).

---

## Error Responses

All error responses follow this structure:

```typescript
interface ErrorResponse {
  error: string;         // Error code or type
  message?: string;      // Human-readable message
  details?: Record<string, unknown>;  // Additional context
}
```

Common HTTP status codes:
- `400 Bad Request` - Validation error or invalid request
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Backend error

---

## Next Steps

1. Run backend API locally (see `specs/master/quickstart.md`)
2. Generate TypeScript types: `npx openapi-typescript ...`
3. Use generated types in API client functions
4. Write integration tests with MSW mocks
