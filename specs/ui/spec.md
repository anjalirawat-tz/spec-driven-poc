# Feature Specification: Accounting & Invoicing UI

**Version**: v1.1 (Role-Agnostic)  
**Date**: 2026-02-09  
**Status**: Planning

---

## Executive Summary

Build a **tenant-scoped web UI** for the Dual-Entry Accounting Service that enables finance, operations, and support teams to review financial transactions, manage invoices, and monitor account health within their tenant boundary.

The UI provides transparent visibility into the accounting service's ledger and invoicing operations without performing any financial calculations itself—all data is authoritative from the backend API.

---

## Business Context

### Problem Statement

As billing volume increases across organizational and individual accounts:
- Finance and operations teams lack visibility into transactions
- Invoice review requires backend support tools
- Investigating account balances is time-consuming and error-prone
- Support teams struggle to answer billing queries without direct database access

### Business Goals

1. Provide **clear, account-level visibility** into ledger transactions
2. Enable **easy invoice review and management** 
3. Reduce dependency on engineering teams for routine financial queries
4. Improve operational efficiency and audit readiness
5. Lay groundwork for future enhancements (RBAC, fleet reporting, dashboards)

### Success Metrics

- Time to answer billing query reduced by 70%
- Support tickets for "check my balance" reduced by 60%
- Invoice review time reduced by 50%
- 100% of financial data matches backend source of truth

---

## Target Users

- **Finance Teams**: Review account balances, validate invoices, reconcile payments
- **Operations Teams**: Monitor account activity, investigate transaction issues
- **Support Teams**: Answer customer billing questions, verify charge details

**Access Model**: Any authenticated user within a tenant (no RBAC enforcement in v1)

---

## Functional Requirements

### Account Management

#### FR-1: Account List View
**Priority**: P1 (MVP)

The UI shall display a paginated list of all accounts within the tenant scope.

**Columns**:
- Account Number
- Account Name  
- Account Type (Organization / Individual)
- Current Balance (USD, formatted with 2 decimals)
- Last Invoice Date
- Status (Active / Inactive)

**Actions**:
- Click account row to open Account Detail View
- Sort by any column
- Filter by account type and status
- Search by account number or name

**Performance**: Load within 2 seconds for up to 1000 accounts

---

#### FR-2: Account Detail View
**Priority**: P1 (MVP)

Selecting an account opens a detailed view with tabbed navigation:

**Tab 1: Account Summary**
- Account metadata (number, name, type, status, created date)
- Current balance (computed from ledger)
- Total charges (all-time)
- Total payments (all-time)
- Outstanding invoices count
- Last transaction date

**Tab 2: Transactions (Ledger)**
- See FR-3 through FR-6

**Tab 3: Invoices**
- See FR-7 through FR-12

---

### Transaction (Ledger) Review

#### FR-3: Ledger List View
**Priority**: P1 (MVP)

The UI shall display a paginated, chronologically ordered list of ledger entries for the selected account.

**Columns**:
- Posting Date (UTC, formatted)
- Transaction Type (Ride Charge / Payment Received)
- Reference ID (Ride ID or Payment Reference)
- Description
- Debit Amount (USD)
- Credit Amount (USD)
- Running Balance (USD)

**Default Filters**: Last 90 days, all transaction types

**Performance**: Load within 2 seconds for last 90 days

---

#### FR-4: Ledger Filters
**Priority**: P1 (MVP)

Users can filter transactions by:
- **Date range**: From date, To date (date pickers)
- **Transaction type**: All / Ride Charge / Payment Received (dropdown)
- **Amount range**: Min amount, Max amount (numeric inputs)

Filters apply immediately or via "Apply Filters" button.

---

#### FR-5: Ledger Entry Detail Modal
**Priority**: P2

Clicking a ledger entry opens a modal/drawer showing:
- Transaction ID
- Account reference
- Transaction type
- Posting date
- Description
- All ledger entry lines (account type, debit, credit)
- Reference ID with link to source (if applicable)
- Linked invoice ID (if applicable)
- Created at timestamp
- Created by (system identifier)

---

#### FR-6: Ledger Read-Only Enforcement
**Priority**: P1 (MVP)

The UI must NOT provide any mechanism to:
- Edit ledger entries
- Delete ledger entries
- Create manual ledger entries

All ledger mutations are performed via backend API only (via other services).

---

### Invoice Management

#### FR-7: Invoice List View
**Priority**: P1 (MVP)

The UI shall display a paginated list of invoices for the selected account.

**Columns**:
- Invoice Number
- Billing Period (date range)
- Invoice Frequency (Per Ride / Daily / Weekly / Monthly)
- Total Amount (USD)
- Amount Paid (USD)
- Outstanding Amount (USD)
- Status (Draft / Issued / Paid / Overdue)
- Issue Date

**Actions**:
- Click invoice row to open Invoice Detail View
- Download invoice PDF
- Sort by any column
- Filter by frequency, status, date range

---

#### FR-8: Invoice Detail View
**Priority**: P1 (MVP)

Invoice detail page displays:

**Header**:
- Invoice number
- Account information
- Billing period
- Issue date
- Due date (if applicable)
- Status

**Line Items Table**:
- Ride ID (with link to ledger entry)
- Service Date
- Description
- Fare Amount (USD)

**Summary**:
- Subtotal
- Tax (if applicable - future)
- Total Amount
- Payments Applied (with dates)
- Outstanding Balance

**Actions**:
- Download PDF
- Edit metadata (FR-10)
- View linked ledger transactions

---

#### FR-9: Invoice PDF Download
**Priority**: P1 (MVP)

Users can download invoices as PDF files.

**Requirements**:
- PDF generation performed by backend API
- UI triggers download via API call
- Filename format: `Invoice-{InvoiceNumber}-{IssueDate}.pdf`
- PDF must match invoice data exactly (no UI-side generation)

**Performance**: Download initiated within 1 second, full download depends on network

---

#### FR-10: Invoice Metadata Editing
**Priority**: P2

UI allows editing of **non-financial metadata only**:

**Editable Fields**:
- Invoice notes (text area, max 1000 chars)
- Internal reference (text input, max 100 chars)
- Billing contact name (text input, max 200 chars)
- Billing contact email (email input, validated)

**Non-Editable Fields** (enforced by disabled inputs):
- Invoice number
- Total amount
- Line items
- Applied payments
- Billing period
- Issue date

**Save Behavior**:
- "Save" button calls backend PATCH endpoint
- Success: Show toast notification, refresh invoice data
- Failure: Show error message with details

---

#### FR-11: Invoice Audit Information
**Priority**: P2

Invoice view displays audit metadata:
- Invoice created at (UTC timestamp)
- Generated by (system identifier)
- Last metadata updated at (UTC timestamp)
- Last updated by (user identifier)

---

### Navigation & Cross-Linking

#### FR-12: Cross-Link Navigation
**Priority**: P2

Users can navigate between related entities:
- **Invoice → Ledger entries**: Click "View Transactions" to see all linked charges/payments
- **Ledger entry → Invoice**: Show invoice link if entry is included in an invoice
- **Ledger entry → Source**: Show Ride ID or Payment Reference (read-only display, no external navigation in v1)

---

### Tenant Isolation

#### FR-13: Tenant Boundary Enforcement
**Priority**: P1 (MVP - Security)

The UI must:
- Display data only for the active tenant
- Include `X-Tenant-ID` header in all API requests
- Show tenant name/ID in header/navigation bar
- Prevent any cross-tenant data access
- Handle tenant context switching (if multi-tenant user, future)

**Implementation**: Tenant ID retrieved from authentication/session context

---

## Non-Functional Requirements

### Performance

- **NFR-1**: Account list loads within 2 seconds for up to 1000 accounts
- **NFR-2**: Ledger list loads within 2 seconds for last 90 days (~500 transactions)
- **NFR-3**: Invoice list loads within 1 second for all invoices (~100 invoices)
- **NFR-4**: Page navigation transitions within 300ms

### Usability

- **NFR-5**: Desktop-first responsive design (1280px+ primary, 768px+ supported)
- **NFR-6**: Consistent currency formatting: `$1,234.56` USD
- **NFR-7**: Date formatting: `Feb 9, 2026` or `2026-02-09` (consistent choice)
- **NFR-8**: Clear loading states for all data fetches
- **NFR-9**: Error messages are user-friendly and actionable

### Data Consistency

- **NFR-10**: All data fetched directly from backend API (no client-side calculations)
- **NFR-11**: Computed values (balances, totals) are backend-calculated
- **NFR-12**: Strong consistency model—user sees current state after refresh

### Accessibility

- **NFR-13**: WCAG 2.1 Level AA compliance (keyboard navigation, screen reader support)
- **NFR-14**: Color contrast ratios meet accessibility standards
- **NFR-15**: Form inputs have proper labels and validation messages

### Browser Support

- **NFR-16**: Chrome 100+, Firefox 100+, Edge 100+, Safari 15+
- **NFR-17**: No IE11 support required

---

## Out of Scope (Future Enhancements)

The following are explicitly **not** included in this version:

- **Role-Based Access Control (RBAC)**: All authenticated users have full tenant access
- **Editing Ledger Entries**: Ledger is immutable, no UI editing
- **Creating Charges or Payments**: Performed via backend APIs only
- **Tax Handling**: USD amounts only, no tax calculations
- **Credit Notes or Adjustments**: Not supported in v1
- **Fleet-Wise Dashboards**: No aggregated financial reporting
- **Account Creation**: Accounts managed via backend/admin tools
- **Bulk Operations**: No multi-invoice actions (bulk download, bulk export)
- **Export to CSV/Excel**: Not in v1
- **Real-Time Updates**: Polling/refresh required, no WebSocket support

---

## Technical Constraints

### Backend API Dependency

- UI is a **pure client application**—no server-side rendering or backend-for-frontend
- All data from Accounting Service REST API (see `specs/master/contracts/accounting-api.yaml`)
- Authentication/authorization handled by existing auth service (assumed)

### Technology Preferences

- Modern JavaScript framework (React, Angular, or Vue)
- TypeScript for type safety
- REST API communication (no GraphQL dependency)
- Component library for consistent UI (Material-UI, Ant Design, or similar)
- Client-side routing (React Router, Angular Router, Vue Router)

### Data Model Assumptions

- All amounts are in USD with 2 decimal precision
- All timestamps are UTC
- Tenant ID is provided via authentication context
- Account IDs, Transaction IDs, Invoice IDs are GUIDs

---

## User Workflows

### Workflow 1: Review Account Balance

1. User navigates to "Accounts" page
2. User searches for account by name or number
3. User clicks account row → opens Account Detail View
4. User views Account Summary tab → sees current balance
5. User clicks "Transactions" tab → reviews recent charges and payments
6. User filters transactions by date range to investigate specific period

### Workflow 2: Investigate Invoice

1. User navigates to "Accounts" page
2. User selects account → opens Account Detail View
3. User clicks "Invoices" tab → sees all invoices
4. User clicks invoice row → opens Invoice Detail View
5. User reviews line items, verifies amounts
6. User clicks "View Transactions" → sees linked ledger entries
7. User downloads invoice PDF for records

### Workflow 3: Update Invoice Metadata

1. User opens Invoice Detail View (via Workflow 2)
2. User clicks "Edit Metadata" button
3. UI enables editable fields (notes, reference, contact info)
4. User updates billing contact email
5. User clicks "Save" → API call updates backend
6. UI shows success toast, refreshes invoice data

---

## API Contract Summary

The UI interacts with the Accounting Service API via the following endpoints:

### Accounts
- `GET /api/v1/accounts` - List accounts (paginated)
- `GET /api/v1/accounts/{accountId}` - Get account details
- `PATCH /api/v1/accounts/{accountId}` - Update account metadata (not ledger-related)

### Ledger Transactions
- `GET /api/v1/ledger/transactions?accountId={id}&from={date}&to={date}` - List transactions
- `GET /api/v1/ledger/transactions/{transactionId}` - Get transaction details

### Invoices
- `GET /api/v1/invoices?accountId={id}` - List invoices (paginated)
- `GET /api/v1/invoices/{invoiceId}` - Get invoice details
- `PATCH /api/v1/invoices/{invoiceId}` - Update invoice metadata
- `GET /api/v1/invoices/{invoiceId}/pdf` - Download invoice PDF

**Note**: Invoice generation endpoints (`POST /api/v1/invoices`) are not exposed to UI—invoices are generated by scheduled jobs or external triggers.

---

## Acceptance Criteria

### Definition of Done

- All FR-1 through FR-13 priority P1 requirements implemented
- UI retrieves data from backend API (no hardcoded/mock data)
- Tenant ID included in all API requests via header
- No ability to edit financial data (ledger entries, invoice amounts)
- Invoice PDF download functional
- Application deployed and accessible via HTTPS
- README includes:
  - Setup instructions
  - Environment configuration
  - API endpoint configuration
  - Build and deployment steps

### Testing Requirements

- Unit tests for business logic (formatters, validators, utilities)
- Integration tests for API client functions
- E2E tests for critical workflows (Workflow 1, 2, 3)
- Manual testing checklist for FR-1 through FR-13

---

## Assumptions

1. **Authentication**: UI assumes user is already authenticated via external auth service (token available)
2. **Tenant Context**: Tenant ID is available from authentication context (JWT claim, session, etc.)
3. **Backend API Availability**: Accounting Service API is deployed and accessible
4. **Data Volumes**: Typical account has < 10,000 transactions, < 1,000 invoices
5. **Currency**: All amounts are USD (no multi-currency support)
6. **Permissions**: All users within a tenant have equal access (no RBAC in v1)

---

## Dependencies

- Accounting Service API (backend dependency - must be deployed first)
- Authentication Service (for user authentication and tenant context)
- PDF generation service (part of Accounting Service backend)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Backend API not ready | High | Low | Coordinate with backend team, use API contract testing |
| Large data volumes exceed performance targets | Medium | Medium | Implement pagination, lazy loading, optimize queries with backend |
| Browser compatibility issues | Low | Low | Use transpilation, polyfills, test on target browsers |
| Tenant isolation breach | Critical | Low | Thorough security review, penetration testing |

---

## Timeline Estimate

**Phase 1** (MVP - Priority P1 features):
- Setup & architecture: 1 week
- Account list & detail views: 1 week  
- Ledger transaction views: 1 week
- Invoice list & detail views: 1 week
- Integration & testing: 1 week
- **Total**: 5 weeks

**Phase 2** (Priority P2 features):
- Ledger entry detail modal: 2 days
- Invoice metadata editing: 3 days
- Cross-link navigation improvements: 2 days
- **Total**: 1 week

**Phase 3** (Polish & optimization):
- Performance optimization: 3 days
- Accessibility improvements: 2 days
- **Total**: 1 week

**Total Estimate**: 7 weeks
