# Tasks: Accounting & Invoicing UI

**Input**: Design documents from `/specs/ui/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Unit tests (Jasmine + Karma), integration tests (HttpTestingController), and E2E tests (Cypress) included incrementally per component.

**Organization**: Tasks are grouped by feature to enable independent implementation and testing of each UI section.

---

## Format: `- [ ] [ID] [P?] [Feature?] Description`

- **[P]**: Can run in parallel (different files/components, no dependencies)
- **[Feature]**: Which feature area this task belongs to (e.g., SETUP, ACCOUNTS, LEDGER, INVOICES)
- Include exact file paths in descriptions

---

## Phase 1: Project Setup & Infrastructure (Foundational)

**Purpose**: Initialize Angular CLI project with core dependencies and configuration

**⚠️ CRITICAL**: No feature work can begin until this phase is complete

- [X] T001 Initialize Angular CLI project with TypeScript in ui/ (ng new accounting-ui)
- [X] T002 [P] Install core dependencies (Angular Material, date-fns) per research.md
- [X] T003 [P] Install dev dependencies (Cypress, ESLint, Prettier) per research.md
- [X] T004 Configure TypeScript (tsconfig.json, tsconfig.app.json) with path aliases and strict mode in ui/
- [X] T005 [P] Configure Angular CLI (angular.json) with dev proxy to backend API in ui/
- [X] T006 [P] Configure ESLint for Angular + TypeScript in ui/
- [X] T007 [P] Configure Prettier (.prettierrc) for code formatting in ui/
- [X] T008 Create environment files (environment.ts, environment.prod.ts) with API_URL in ui/src/environments/
- [X] T009 Update package.json scripts (start, build, test, lint, e2e) in ui/
- [X] T010 Create project module structure (core/, shared/, features/, models/) in ui/src/app/

**Checkpoint**: Project setup complete - feature implementation can now begin

---

## Phase 2: Core Infrastructure (Blocking Prerequisites)

**Purpose**: Core services, interceptors, layouts, and utilities that ALL features depend on

**⚠️ CRITICAL**: No UI features can be built until this phase is complete

### Core Services & Interceptors

- [X] T011 [SETUP] Create CoreModule with singleton services in ui/src/app/core/core.module.ts
- [X] T012 [P] [SETUP] Create TypeScript models for Account in ui/src/app/models/account.model.ts
- [X] T013 [P] [SETUP] Create TypeScript models for LedgerTransaction in ui/src/app/models/ledger-transaction.model.ts
- [X] T014 [P] [SETUP] Create TypeScript models for Invoice in ui/src/app/models/invoice.model.ts
- [X] T015 [P] [SETUP] Create common types (PaginationMeta, ErrorResponse) in ui/src/app/models/common.model.ts

### Services & Interceptors

- [X] T016 [SETUP] Create TenantService in ui/src/app/core/services/tenant.service.ts
- [X] T017 [SETUP] Create TenantInterceptor for X-Tenant-ID header in ui/src/app/core/interceptors/tenant.interceptor.ts
- [X] T018 [SETUP] Configure router in ui/src/app/app-routing.module.ts

### Layout Components

- [X] T019 [P] [SETUP] Create LayoutComponent (app shell) in ui/src/app/shared/components/layout/
- [X] T020 [P] [SETUP] Create HeaderComponent with tenant display in ui/src/app/shared/components/header/
- [X] T021 [P] [SETUP] Create NotFoundComponent in ui/src/app/shared/components/not-found/

### Utilities & Pipes

- [X] T022 [P] [SETUP] Create CurrencyFormatPipe in ui/src/app/shared/pipes/currency-format.pipe.ts
- [X] T023 [P] [SETUP] Create DateFormatPipe in ui/src/app/shared/pipes/date-format.pipe.ts
- [X] T024 [P] [SETUP] Create custom validators in ui/src/app/shared/validators/
- [X] T025 [P] [SETUP] Create constants file in ui/src/app/shared/constants.ts

### Shared Components

- [X] T026 [P] [SETUP] Create LoadingSpinnerComponent in ui/src/app/shared/components/loading-spinner/
- [X] T027 [P] [SETUP] Create ErrorAlertComponent in ui/src/app/shared/components/error-alert/
- [X] T028 [P] [SETUP] Create EmptyStateComponent in ui/src/app/shared/components/empty-state/
- [X] T029 [P] [SETUP] Create StatusBadgeComponent in ui/src/app/shared/components/status-badge/
- [X] T030 [P] [SETUP] Create SharedModule with common components and pipes in ui/src/app/shared/shared.module.ts

**Checkpoint**: Core infrastructure ready - feature components can now be built

---

## Phase 3: User Story 1 - Account List & Detail Views (Priority: P1) 🎯 MVP

**Goal**: Display accounts with filtering, enable navigation to account details with tabbed views

**Functional Requirements**: FR-1 (Account List View), FR-2 (Account Detail View), FR-15 (Tenant Isolation)

**Independent Test**: View account list, filter by type/status, search by name, click account to view details with tabs

### Account Service

- [X] T031 [P] [ACCOUNTS] Create AccountService with HttpClient in ui/src/app/core/services/account.service.ts
- [X] T032 [P] [ACCOUNTS] Implement getAccounts() method with RxJS Observable
- [X] T033 [P] [ACCOUNTS] Implement getAccountById() method
- [X] T034 [P] [ACCOUNTS] Implement updateAccount() method

### Account List Component

- [X] T035 [ACCOUNTS] Create AccountsModule in ui/src/app/features/accounts/
- [X] T036 [P] [ACCOUNTS] Create AccountListComponent in ui/src/app/features/accounts/components/account-list/
- [X] T037 [ACCOUNTS] Create AccountFiltersComponent (search, type, status) in ui/src/app/features/accounts/components/account-filters/
- [X] T038 [ACCOUNTS] Create AccountTableComponent with Angular Material Table in ui/src/app/features/accounts/components/account-table/
- [X] T039 [ACCOUNTS] Implement pagination, sorting, and filtering with MatTableDataSource

### Account Detail Component

- [X] T040 [ACCOUNTS] Create AccountDetailComponent with Angular Material Tabs in ui/src/app/features/accounts/components/account-detail/
- [X] T041 [P] [ACCOUNTS] Create AccountHeaderComponent (name, number, balance) in ui/src/app/features/accounts/components/account-header/
- [X] T042 [ACCOUNTS] Create AccountSummaryComponent with metadata display in ui/src/app/features/accounts/components/account-summary/
- [X] T043 [P] [ACCOUNTS] Create AccountStatsComponent (totals, last activity) in ui/src/app/features/accounts/components/account-stats/

### Testing

- [ ] T044 [P] [ACCOUNTS] Write unit tests for pipes (CurrencyFormatPipe, DateFormatPipe) with Jasmine
- [ ] T045 [P] [ACCOUNTS] Write service tests for AccountService with HttpTestingController
- [ ] T046 [ACCOUNTS] Write E2E test for account list workflow with Cypress

**Checkpoint**: User Story 1 complete - can view and navigate accounts with tenant isolation

---

## Phase 4: User Story 2 - Ledger Transaction Views (Priority: P1) 🎯 MVP

**Goal**: Display ledger transactions for an account with filtering, enforce read-only access

**Functional Requirements**: FR-3 (Ledger List), FR-4 (Filters), FR-5 (Detail View), FR-6 (Read-Only)

**Independent Test**: View ledger transactions for account, filter by date/type/amount, verify read-only enforcement

### Ledger Service

- [X] T047 [P] [LEDGER] Create LedgerService with HttpClient in ui/src/app/core/services/ledger.service.ts
- [X] T048 [P] [LEDGER] Implement getLedgerTransactions() method with RxJS Observable
- [X] T049 [P] [LEDGER] Implement getLedgerTransactionById() method

### Ledger Components (Account Transactions Tab)

- [X] T050 [LEDGER] Create LedgerModule in ui/src/app/features/ledger/
- [X] T051 [P] [LEDGER] Create AccountTransactionsComponent in ui/src/app/features/accounts/components/account-transactions/
- [X] T052 [P] [LEDGER] Create LedgerFiltersComponent (date range, type, amount) in ui/src/app/features/ledger/components/ledger-filters/
- [X] T053 [LEDGER] Create LedgerTableComponent with Angular Material Table in ui/src/app/features/ledger/components/ledger-table/
- [X] T054 [LEDGER] Implement running balance calculation display in LedgerTable
- [X] T055 [LEDGER] Implement pagination and filtering with MatTableDataSource
- [X] T056 [P] [LEDGER] Create LedgerDetailDialogComponent in ui/src/app/features/ledger/components/ledger-detail-dialog/
- [X] T057 [LEDGER] Add click handler to open LedgerDetailDialog (Priority: P2 - optional for MVP)

### Testing

- [ ] T058 [P] [LEDGER] Write service tests for LedgerService with HttpTestingController
- [ ] T059 [LEDGER] Write E2E test for ledger filtering workflow with Cypress

**Checkpoint**: User Story 2 complete - can view and filter ledger transactions with read-only enforcement

---

## Phase 5: User Story 3 - Invoice List & Detail Views (Priority: P1) 🎯 MVP

**Goal**: Display invoices for an account, view invoice details with line items, download PDF

**Functional Requirements**: FR-7 (Invoice List), FR-8 (Invoice Detail), FR-9 (PDF Download)

**Independent Test**: View invoices for account, click invoice to view details, download invoice PDF

### Invoice Service

- [ ] T060 [P] [INVOICES] Create InvoiceService with HttpClient in ui/src/app/core/services/invoice.service.ts
- [ ] T061 [P] [INVOICES] Implement getInvoices() method with RxJS Observable
- [ ] T062 [P] [INVOICES] Implement getInvoiceById() method
- [ ] T063 [P] [INVOICES] Implement downloadInvoicePDF() method

### Invoice List Component (Account Invoices Tab)

- [ ] T064 [INVOICES] Create InvoicesModule in ui/src/app/features/invoices/
- [ ] T065 [P] [INVOICES] Create AccountInvoicesComponent in ui/src/app/features/accounts/components/account-invoices/
- [ ] T066 [INVOICES] Create InvoiceFiltersComponent (frequency, status, date) in ui/src/app/features/invoices/components/invoice-filters/
- [ ] T067 [INVOICES] Create InvoiceTableComponent with Angular Material Table in ui/src/app/features/invoices/components/invoice-table/
- [ ] T068 [INVOICES] Implement pagination, sorting, and filtering with MatTableDataSource

### Invoice Detail Component

- [ ] T069 [INVOICES] Create InvoiceDetailComponent in ui/src/app/features/invoices/components/invoice-detail/
- [ ] T070 [P] [INVOICES] Create InvoiceHeaderComponent (number, status, dates) in ui/src/app/features/invoices/components/invoice-header/
- [ ] T071 [P] [INVOICES] Create InvoiceLineItemsComponent in ui/src/app/features/invoices/components/invoice-line-items/
- [ ] T072 [P] [INVOICES] Create InvoiceSummaryComponent (totals, payments, outstanding) in ui/src/app/features/invoices/components/invoice-summary/
- [ ] T073 [INVOICES] Create InvoiceActionsComponent (download PDF, view transactions) in ui/src/app/features/invoices/components/invoice-actions/
- [ ] T074 [INVOICES] Implement PDF download functionality with Blob handling

### Testing

- [ ] T075 [P] [INVOICES] Write service tests for InvoiceService with HttpTestingController
- [ ] T076 [INVOICES] Write E2E test for invoice navigation and PDF download workflow with Cypress

**Checkpoint**: User Story 3 complete - can view invoices and download PDFs

---

## Phase 6: User Story 4 - Invoice Metadata Editing (Priority: P2)

**Goal**: Allow editing of non-financial invoice metadata with validation

**Functional Requirements**: FR-10 (Editable Fields), FR-11 (Non-Editable Fields), FR-12 (Audit Info)

**Independent Test**: Edit invoice notes and billing contact, verify financial fields are disabled, save metadata

### Invoice Metadata Editing

- [ ] T077 [P] [INVOICES] Implement updateInvoiceMetadata() method in InvoiceService
- [ ] T078 [INVOICES] Create InvoiceMetadataFormComponent with Angular Reactive Forms in ui/src/app/features/invoices/components/invoice-metadata-form/
- [ ] T079 [INVOICES] Implement editable fields (notes, reference, contact) with FormControl validators
- [ ] T080 [INVOICES] Implement disabled state for non-editable fields (totals, line items)
- [ ] T081 [INVOICES] Add save/cancel handlers with RxJS operators
- [ ] T082 [P] [INVOICES] Display audit information (created, updated timestamps) in InvoiceDetail
- [ ] T083 [INVOICES] Add Angular Material Snackbar for success/error messages

### Testing

- [ ] T084 [P] [INVOICES] Write unit tests for validators (email, maxLength)
- [ ] T085 [INVOICES] Write E2E test for invoice metadata editing workflow with Cypress

**Checkpoint**: User Story 4 complete - can edit invoice metadata with proper validation

---

## Phase 7: Cross-Linking & Navigation (Priority: P2)

**Goal**: Enable navigation between related entities (invoice ↔ ledger, ledger → source)

**Functional Requirements**: FR-13 (Cross-Link Navigation)

**Independent Test**: Navigate from invoice to ledger entries, from ledger entry to invoice

### Cross-Linking Implementation

- [ ] T086 [P] [LEDGER] Add invoice link column to LedgerTable (when transaction has invoiceId)
- [ ] T087 [P] [INVOICES] Add "View Transactions" button to InvoiceDetailComponent
- [ ] T088 [INVOICES] Implement navigation from invoice to filtered ledger view (account + date range) with Angular Router
- [ ] T089 [P] [LEDGER] Add Ride ID / Payment Reference display in LedgerDetailDialog (read-only)
- [ ] T090 [LEDGER] Update LedgerDetailDialog to show linked invoice (if applicable)

### Testing

- [ ] T091 [INVOICES] Write E2E test for cross-linking navigation workflow with Cypress

**Checkpoint**: User Story 5 complete - cross-linking enables efficient investigation

---

## Phase 8: Testing & Accessibility (Priority: P1 - Quality Gates)

**Purpose**: Comprehensive test coverage and accessibility compliance (WCAG 2.1 Level AA)

### Unit Testing

- [ ] T092 [P] [TESTING] Write unit tests for all pipes (CurrencyFormat, DateFormat) with Jasmine
- [ ] T093 [P] [TESTING] Write unit tests for all custom validators
- [ ] T094 [P] [TESTING] Write component tests for shared components (LoadingSpinner, ErrorAlert, etc.) with Jasmine
- [ ] T095 [TESTING] Achieve 80% code coverage for business logic in ui/src/app/shared/

### Integration Testing

- [ ] T096 [P] [TESTING] Configure Karma test runner in ui/karma.conf.js
- [ ] T097 [P] [TESTING] Write service tests with HttpTestingController for all services
- [ ] T098 [P] [TESTING] Write component integration tests with TestBed (AccountList, LedgerTable, InvoiceDetail)

### E2E Testing

- [ ] T099 [TESTING] Setup Cypress with base URL and viewport configuration in ui/cypress.config.js
- [ ] T100 [P] [TESTING] Write E2E test for complete account workflow (list → detail → tabs)
- [ ] T101 [P] [TESTING] Write E2E test for ledger filtering workflow
- [ ] T102 [P] [TESTING] Write E2E test for invoice investigation workflow (list → detail → PDF)
- [ ] T103 [TESTING] Write E2E test for invoice metadata editing workflow

### Accessibility

- [ ] T104 [P] [TESTING] Run axe DevTools audit on all pages, fix violations
- [ ] T105 [P] [TESTING] Test keyboard navigation for all interactive elements
- [ ] T106 [P] [TESTING] Verify color contrast ratios meet WCAG 2.1 Level AA (4.5:1 text, 3:1 large text)
- [ ] T107 [P] [TESTING] Add ARIA labels to icon-only buttons and controls
- [ ] T108 [TESTING] Manual screen reader testing (NVDA or JAWS) for critical workflows

**Checkpoint**: Testing complete - UI is production-ready

---

## Phase 9: Performance Optimization & Polish (Priority: P1 - Production)

**Purpose**: Optimize performance, bundle size, and user experience

### Performance

- [ ] T109 [P] [POLISH] Implement lazy loading for feature modules (AccountsModule, LedgerModule, InvoicesModule)
- [ ] T110 [P] [POLISH] Implement OnPush change detection strategy for components
- [ ] T111 [P] [POLISH] Analyze bundle size with Angular CLI bundle analyzer (ng build --stats-json), optimize imports
- [ ] T112 [POLISH] Verify account list loads < 2 seconds (1000 accounts)
- [ ] T113 [POLISH] Verify ledger list loads < 2 seconds (90 days)
- [ ] T114 [POLISH] Verify invoice list loads < 1 second
- [ ] T115 [POLISH] Verify page transitions < 300ms

### Error Handling

- [ ] T116 [P] [POLISH] Create ErrorInterceptor for HTTP errors in ui/src/app/core/interceptors/error.interceptor.ts
- [ ] T117 [P] [POLISH] Configure global error handling in AppModule
- [ ] T118 [POLISH] Add 401 redirect to login in ErrorInterceptor
- [ ] T119 [P] [POLISH] Add user-friendly error messages for all API failures with Angular Material Snackbar

### UX Polish

- [ ] T120 [P] [POLISH] Add loading states for all Observable subscriptions
- [ ] T121 [P] [POLISH] Add empty states for all lists (no accounts, no transactions, no invoices)
- [ ] T122 [P] [POLISH] Add Angular Material Snackbar for success messages (update account, update invoice, etc.)
- [ ] T123 [P] [POLISH] Add Angular Material Dialog for confirmation (if any)
- [ ] T124 [POLISH] Verify consistent styling and spacing across all pages

### Documentation

- [ ] T125 [P] [POLISH] Create comprehensive README.md in ui/ with setup, dev, and deployment instructions
- [ ] T126 [P] [POLISH] Document environment variables in README.md
- [ ] T127 [P] [POLISH] Add JSDoc comments to complex functions and components

**Checkpoint**: Polish complete - UI is optimized and documented

---

## Phase 10: Build & Deployment (Priority: P1 - Production)

**Purpose**: Production build, deployment setup, and CI/CD configuration

### Build Configuration

- [ ] T128 [DEPLOY] Verify production build succeeds (npm run build)
- [ ] T129 [P] [DEPLOY] Verify production build size is acceptable (< 1MB gzipped)
- [ ] T130 [P] [DEPLOY] Test production build locally (npm run preview)
- [ ] T131 [DEPLOY] Verify all environment variables are correctly loaded in production

### Deployment Setup

- [ ] T132 [P] [DEPLOY] Create deployment configuration for chosen platform (Netlify/Vercel/AWS)
- [ ] T133 [P] [DEPLOY] Setup redirect rules for SPA routing (/* → /index.html)
- [ ] T134 [P] [DEPLOY] Configure CORS on backend API for production UI origin
- [ ] T135 [DEPLOY] Deploy to staging environment and verify functionality
- [ ] T136 [DEPLOY] Run smoke tests on staging deployment
- [ ] T137 [DEPLOY] Deploy to production environment

### CI/CD (Optional)

- [ ] T138 [P] [DEPLOY] Create GitHub Actions workflow for build and test
- [ ] T139 [P] [DEPLOY] Create GitHub Actions workflow for deployment to staging (on PR)
- [ ] T140 [DEPLOY] Create GitHub Actions workflow for deployment to production (on merge to main)

**Checkpoint**: Deployment complete - UI is live in production

---

## Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Core Infrastructure)
    ↓
    ├─→ Phase 3 (Accounts)
    ├─→ Phase 4 (Ledger)
    └─→ Phase 5 (Invoices)
            ↓
        Phase 6 (Invoice Metadata Editing)
            ↓
        Phase 7 (Cross-Linking)
            ↓
    Phase 8 (Testing)
    Phase 9 (Polish)
    Phase 10 (Deployment)
```

**Note**: Phases 3-5 can be developed in parallel after Phase 2 is complete.

---

## Parallel Execution Opportunities

### After Phase 2 Complete:
- **Team A**: Phase 3 (Accounts) → T031-T046
- **Team B**: Phase 4 (Ledger) → T047-T059
- **Team C**: Phase 5 (Invoices) → T060-T076

### During Phase 8 (Testing):
- Unit tests, integration tests, and E2E tests can be written in parallel
- Accessibility audits can run concurrently with test writing

### During Phase 9 (Polish):
- Performance optimization, error handling, UX polish, and documentation can proceed in parallel

---

## Implementation Strategy

**MVP First** (Phases 1-5, 8-10): 
- Core functionality for viewing accounts, ledger, and invoices
- Essential testing and performance optimization
- Production deployment
- **Estimated**: 5 weeks

**Enhancements** (Phases 6-7):
- Invoice metadata editing
- Cross-linking navigation
- **Estimated**: 1 week

**Total Estimated Timeline**: 6-7 weeks for full feature set

---

## Task Count Summary

- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Core Infrastructure)**: 20 tasks
- **Phase 3 (Accounts)**: 16 tasks
- **Phase 4 (Ledger)**: 13 tasks
- **Phase 5 (Invoices)**: 17 tasks
- **Phase 6 (Invoice Metadata)**: 9 tasks
- **Phase 7 (Cross-Linking)**: 6 tasks
- **Phase 8 (Testing)**: 17 tasks
- **Phase 9 (Polish)**: 19 tasks
- **Phase 10 (Deployment)**: 13 tasks

**Total**: 140 tasks

**Parallelizable Tasks**: 71 tasks marked with [P] (51%)

---

## Suggested MVP Scope

For fastest time-to-value, implement:
- ✅ Phase 1: Setup (T001-T010)
- ✅ Phase 2: Core Infrastructure (T011-T030)
- ✅ Phase 3: Accounts (T031-T046)
- ✅ Phase 4: Ledger (T047-T059)
- ✅ Phase 5: Invoices (T060-T076)
- ✅ Phase 8: Testing (T092-T108 - essential tests only)
- ✅ Phase 9: Polish (T109-T127 - performance & UX)
- ✅ Phase 10: Deployment (T128-T137)

This delivers all P1 features (FR-1 through FR-9, FR-15) with production quality.

**Defer to Phase 2**:
- Phase 6: Invoice metadata editing (P2 features)
- Phase 7: Cross-linking enhancements (P2 features)

---

**Date**: 2026-02-09  
**Status**: Ready for Implementation  
**Next Step**: Begin Phase 1 (T001) - Initialize Angular CLI project
