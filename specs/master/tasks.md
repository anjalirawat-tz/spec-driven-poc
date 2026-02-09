# Tasks: Dual-Entry Accounting & Invoicing Service

**Input**: Design documents from `/specs/master/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in specification - focusing on production implementation. Unit/Integration tests can be added incrementally per .NET best practices.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic .NET solution structure

- [X] T001 Create solution structure in api/ with four projects per plan.md
- [X] T002 Initialize AccountingService.Domain project (.NET 8.0 class library) in api/src/AccountingService.Domain/
- [X] T003 [P] Initialize AccountingService.Application project (.NET 8.0 class library) in api/src/AccountingService.Application/
- [X] T004 [P] Initialize AccountingService.Infrastructure project (.NET 8.0 class library) in api/src/AccountingService.Infrastructure/
- [X] T005 [P] Initialize AccountingService.API project (ASP.NET Core Web API) in api/src/AccountingService.API/
- [X] T006 [P] Initialize test projects in api/tests/ (Domain.Tests, Application.Tests, IntegrationTests)
- [X] T007 Add NuGet package references per research.md decisions (EF Core, MediatR, FluentValidation, Polly, Serilog, OpenTelemetry)
- [X] T008 [P] Setup project dependencies (API → Infrastructure → Application → Domain)
- [X] T009 [P] Configure EditorConfig for C# formatting standards
- [X] T010 Create docker-compose.yml for PostgreSQL 16 in api/
- [X] T011 [P] Setup appsettings.json and appsettings.Development.json with connection strings

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T012 Create base TenantEntity abstract class in api/src/AccountingService.Domain/Common/TenantEntity.cs
- [X] T013 [P] Create Money value object in api/src/AccountingService.Domain/ValueObjects/Money.cs
- [X] T014 [P] Create DateRange value object in api/src/AccountingService.Domain/ValueObjects/DateRange.cs
- [X] T015 [P] Create Result pattern classes in api/src/AccountingService.Domain/Common/Result.cs
- [X] T016 Create ICurrentTenant interface in api/src/AccountingService.Application/Interfaces/ICurrentTenant.cs
- [X] T017 Implement TenantService in api/src/AccountingService.Infrastructure/Services/TenantService.cs
- [X] T018 Create TenantMiddleware in api/src/AccountingService.API/Middleware/TenantMiddleware.cs
- [X] T019 [P] Create CorrelationIdMiddleware in api/src/AccountingService.API/Middleware/CorrelationIdMiddleware.cs
- [X] T020 [P] Create ErrorHandlingMiddleware in api/src/AccountingService.API/Middleware/ErrorHandlingMiddleware.cs
- [X] T021 Create IAccountingDbContext interface in api/src/AccountingService.Application/Interfaces/IAccountingDbContext.cs
- [X] T022 Create AccountingDbContext stub in api/src/AccountingService.Infrastructure/Persistence/AccountingDbContext.cs
- [X] T023 Configure Serilog with correlation ID enrichment in api/src/AccountingService.API/Program.cs
- [X] T024 [P] Configure OpenTelemetry for metrics and tracing in api/src/AccountingService.API/Program.cs
- [X] T025 Setup MediatR with pipeline behaviors in api/src/AccountingService.Application/Extensions/ServiceCollectionExtensions.cs
- [X] T026 [P] Create ValidationBehavior for FluentValidation in api/src/AccountingService.Application/Behaviors/ValidationBehavior.cs
- [X] T027 [P] Create LoggingBehavior in api/src/AccountingService.Application/Behaviors/LoggingBehavior.cs
- [X] T028 Create TransactionBehavior with double-entry validation in api/src/AccountingService.Application/Behaviors/TransactionBehavior.cs
- [X] T029 Configure dependency injection in api/src/AccountingService.API/Program.cs
- [X] T030 [P] Add health check endpoints in api/src/AccountingService.API/Controllers/HealthController.cs
- [X] T031 Configure Swagger/OpenAPI with multi-tenancy header in api/src/AccountingService.API/Program.cs

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Account Management Foundation (Priority: P1) 🎯 MVP

**Goal**: Create and manage accounts with multi-tenant isolation, enabling basic account operations

**Functional Requirements**: FR-1 (Create Account), FR-14 (Tenant Isolation)

**Independent Test**: Create organization and individual accounts via API, verify tenant isolation prevents cross-tenant access

### Domain Model for User Story 1

- [X] T032 [P] [US1] Create AccountType enum in api/src/AccountingService.Domain/Aggregates/AccountAggregate/AccountType.cs
- [X] T033 [P] [US1] Create AccountStatus enum in api/src/AccountingService.Domain/Aggregates/AccountAggregate/AccountStatus.cs
- [X] T034 [US1] Create Account aggregate root in api/src/AccountingService.Domain/Aggregates/AccountAggregate/Account.cs
- [X] T035 [US1] Create AccountCreated domain event in api/src/AccountingService.Domain/Aggregates/AccountAggregate/Events/AccountCreated.cs
- [X] T036 [P] [US1] Create AccountDeactivated domain event in api/src/AccountingService.Domain/Aggregates/AccountAggregate/Events/AccountDeactivated.cs

### Application Layer for User Story 1

- [X] T037 [P] [US1] Create AccountDto in api/src/AccountingService.Application/DTOs/AccountDto.cs
- [X] T038 [P] [US1] Create CreateAccountCommand in api/src/AccountingService.Application/Commands/CreateAccount/CreateAccountCommand.cs
- [X] T039 [US1] Create CreateAccountCommandHandler in api/src/AccountingService.Application/Commands/CreateAccount/CreateAccountCommandHandler.cs
- [X] T040 [US1] Create CreateAccountValidator in api/src/AccountingService.Application/Commands/CreateAccount/CreateAccountValidator.cs
- [X] T041 [P] [US1] Create UpdateAccountCommand in api/src/AccountingService.Application/Commands/UpdateAccount/UpdateAccountCommand.cs
- [X] T042 [US1] Create UpdateAccountCommandHandler in api/src/AccountingService.Application/Commands/UpdateAccount/UpdateAccountCommandHandler.cs
- [X] T043 [P] [US1] Create GetAccountQuery in api/src/AccountingService.Application/Queries/GetAccount/GetAccountQuery.cs
- [X] T044 [US1] Create GetAccountQueryHandler in api/src/AccountingService.Application/Queries/GetAccount/GetAccountQueryHandler.cs
- [X] T045 [P] [US1] Create ListAccountsQuery in api/src/AccountingService.Application/Queries/ListAccounts/ListAccountsQuery.cs
- [X] T046 [US1] Create ListAccountsQueryHandler in api/src/AccountingService.Application/Queries/ListAccounts/ListAccountsQueryHandler.cs

### Infrastructure Layer for User Story 1

- [X] T047 [US1] Create Account entity configuration in api/src/AccountingService.Infrastructure/Persistence/Configurations/AccountConfiguration.cs
- [X] T048 [US1] Update AccountingDbContext with Account DbSet and global query filter in api/src/AccountingService.Infrastructure/Persistence/AccountingDbContext.cs
- [X] T049 [US1] Create initial migration with Account table in api/src/AccountingService.Infrastructure/Persistence/Migrations/
- [ ] T050 [US1] Configure EF Core retry policy per research.md in api/src/AccountingService.Infrastructure/Extensions/ServiceCollectionExtensions.cs

### API Layer for User Story 1

- [X] T051 [US1] Create AccountsController in api/src/AccountingService.API/Controllers/AccountsController.cs
- [X] T052 [US1] Implement POST /v1/accounts endpoint per OpenAPI spec
- [X] T053 [US1] Implement GET /v1/accounts endpoint with pagination per OpenAPI spec
- [X] T054 [US1] Implement GET /v1/accounts/{accountId} endpoint per OpenAPI spec
- [X] T055 [US1] Implement PATCH /v1/accounts/{accountId} endpoint per OpenAPI spec

**Checkpoint**: User Story 1 complete - can create/manage accounts with tenant isolation

---

## Phase 4: User Story 2 - Ledger: Ride Charge Recording (Priority: P2)

**Goal**: Record ride service charges using double-entry bookkeeping with idempotency

**Functional Requirements**: FR-3 (Record Ride Charge), FR-4 (Ride Idempotency), FR-15 (Audit Metadata)

**Independent Test**: Record ride charge via API, verify two balanced ledger entries created (Debit AR, Credit Revenue), retry same charge returns success without duplication

### Domain Model for User Story 2

- [X] T056 [P] [US2] Create TransactionType enum in api/src/AccountingService.Domain/Aggregates/LedgerAggregate/TransactionType.cs
- [X] T057 [P] [US2] Create LedgerAccountType enum in api/src/AccountingService.Domain/Aggregates/LedgerAggregate/LedgerAccountType.cs
- [X] T058 [US2] Create LedgerTransaction aggregate root in api/src/AccountingService.Domain/Aggregates/LedgerAggregate/LedgerTransaction.cs
- [X] T059 [US2] Create LedgerEntry entity in api/src/AccountingService.Domain/Aggregates/LedgerAggregate/LedgerEntry.cs
- [X] T060 [US2] Create RideChargeRecorded domain event in api/src/AccountingService.Domain/Aggregates/LedgerAggregate/Events/RideChargeRecorded.cs
- [X] T061 [US2] Create ILedgerService interface in api/src/AccountingService.Domain/Services/ILedgerService.cs

### Application Layer for User Story 2

- [X] T062 [P] [US2] Create LedgerTransactionDto in api/src/AccountingService.Application/DTOs/LedgerTransactionDto.cs
- [X] T063 [US2] Create RecordRideChargeCommand in api/src/AccountingService.Application/Commands/RecordRideCharge/RecordRideChargeCommand.cs
- [X] T064 [US2] Create RecordRideChargeCommandHandler in api/src/AccountingService.Application/Commands/RecordRideCharge/RecordRideChargeCommandHandler.cs
- [X] T065 [US2] Create RecordRideChargeValidator in api/src/AccountingService.Application/Commands/RecordRideCharge/RecordRideChargeValidator.cs
- [X] T066 [P] [US2] Create GetLedgerTransactionQuery in api/src/AccountingService.Application/Queries/GetLedgerTransaction/GetLedgerTransactionQuery.cs
- [X] T067 [US2] Create GetLedgerTransactionQueryHandler in api/src/AccountingService.Application/Queries/GetLedgerTransaction/GetLedgerTransactionQueryHandler.cs

### Infrastructure Layer for User Story 2

- [X] T068 [US2] Implement LedgerService with double-entry logic in api/src/AccountingService.Infrastructure/Services/LedgerService.cs
- [X] T069 [P] [US2] Create LedgerTransaction entity configuration in api/src/AccountingService.Infrastructure/Persistence/Configurations/LedgerTransactionConfiguration.cs
- [X] T070 [P] [US2] Create LedgerEntry entity configuration in api/src/AccountingService.Infrastructure/Persistence/Configurations/LedgerEntryConfiguration.cs
- [X] T071 [US2] Update AccountingDbContext with LedgerTransaction and LedgerEntry DbSets in api/src/AccountingService.Infrastructure/Persistence/AccountingDbContext.cs
- [X] T072 [US2] Create migration for LedgerTransaction and LedgerEntry tables with indexes in api/src/AccountingService.Infrastructure/Persistence/Migrations/
- [X] T073 [US2] Add unique index for idempotency key (TenantId, IdempotencyKey) in migration

### API Layer for User Story 2

- [X] T074 [US2] Create LedgerController in api/src/AccountingService.API/Controllers/LedgerController.cs
- [X] T075 [US2] Implement POST /v1/ledger/charges endpoint per OpenAPI spec
- [X] T076 [US2] Implement GET /v1/ledger/transactions/{transactionId} endpoint per OpenAPI spec
- [X] T077 [US2] Add idempotent response handling (201 vs 200) for duplicate charges

**Checkpoint**: User Story 2 complete - can record ride charges with double-entry and idempotency

---

## Phase 5: User Story 3 - Ledger: Payment Recording (Priority: P3)

**Goal**: Record payment receipts using double-entry bookkeeping with support for partial/advance payments

**Functional Requirements**: FR-5 (Record Payment Received), FR-6 (Partial and Advance Payments)

**Independent Test**: Record payment via API, verify two balanced ledger entries created (Debit Cash, Credit AR), record partial payment and verify balance decreases correctly, record overpayment and verify negative balance

### Domain Model for User Story 3

- [X] T078 [US3] Create PaymentRecorded domain event in api/src/AccountingService.Domain/Aggregates/LedgerAggregate/Events/PaymentRecorded.cs
- [X] T079 [US3] Extend ILedgerService with RecordPaymentAsync in api/src/AccountingService.Domain/Services/ILedgerService.cs

### Application Layer for User Story 3

- [X] T080 [US3] Create RecordPaymentCommand in api/src/AccountingService.Application/Commands/RecordPayment/RecordPaymentCommand.cs
- [X] T081 [US3] Create RecordPaymentCommandHandler in api/src/AccountingService.Application/Commands/RecordPayment/RecordPaymentCommandHandler.cs
- [X] T082 [US3] Create RecordPaymentValidator in api/src/AccountingService.Application/Commands/RecordPayment/RecordPaymentValidator.cs

### Infrastructure Layer for User Story 3

- [X] T083 [US3] Implement RecordPaymentAsync in LedgerService in api/src/AccountingService.Infrastructure/Services/LedgerService.cs

### API Layer for User Story 3

- [X] T084 [US3] Implement POST /v1/ledger/payments endpoint in LedgerController per OpenAPI spec
- [X] T085 [US3] Add idempotent response handling (201 vs 200) for duplicate payments

**Checkpoint**: User Story 3 complete - can record payments with partial/advance payment support

---

## Phase 6: User Story 4 - Balance and Statements (Priority: P4)

**Goal**: Compute account balances from ledger and generate account statements for date ranges

**Functional Requirements**: FR-2 (Account Ledger), FR-7 (Balance Calculation), FR-8 (Account Statement)

**Independent Test**: Query balance after multiple charges and payments, verify calculation matches SUM(Debits - Credits), generate statement for date range and verify opening/closing balances and transaction history

### Application Layer for User Story 4

- [ ] T086 [P] [US4] Create AccountBalanceDto in api/src/AccountingService.Application/DTOs/AccountBalanceDto.cs
- [ ] T087 [P] [US4] Create AccountStatementDto and StatementLineDto in api/src/AccountingService.Application/DTOs/AccountStatementDto.cs
- [ ] T088 [US4] Create GetAccountBalanceQuery in api/src/AccountingService.Application/Queries/GetAccountBalance/GetAccountBalanceQuery.cs
- [ ] T089 [US4] Create GetAccountBalanceQueryHandler with optimized EF query in api/src/AccountingService.Application/Queries/GetAccountBalance/GetAccountBalanceQueryHandler.cs
- [ ] T090 [P] [US4] Create GetAccountStatementQuery in api/src/AccountingService.Application/Queries/GetAccountStatement/GetAccountStatementQuery.cs
- [ ] T091 [US4] Create GetAccountStatementQueryHandler with running balance calculation in api/src/AccountingService.Application/Queries/GetAccountStatement/GetAccountStatementQueryHandler.cs

### API Layer for User Story 4

- [ ] T092 [US4] Implement GET /v1/accounts/{accountId}/balance endpoint in AccountsController per OpenAPI spec
- [ ] T093 [US4] Implement GET /v1/accounts/{accountId}/statement endpoint with date range validation in AccountsController per OpenAPI spec
- [ ] T094 [US4] Add asOfDate query parameter support for balance queries

**Checkpoint**: User Story 4 complete - can query balances and generate statements

---

## Phase 7: User Story 5 - Invoice Generation (Priority: P5)

**Goal**: Generate invoices at multiple frequencies (per-ride, daily, weekly, monthly) with ledger traceability

**Functional Requirements**: FR-9 (Invoice Frequencies), FR-10 (On-Demand Generation), FR-11 (Invoice Structure), FR-12 (Ledger Traceability), FR-13 (Invoice Immutability)

**Independent Test**: Generate per-ride invoice and verify line item, generate monthly invoice with multiple rides and verify subtotal, apply payments and verify outstanding balance, attempt to modify issued invoice and verify immutability

### Domain Model for User Story 5

- [ ] T095 [P] [US5] Create InvoiceFrequency enum in api/src/AccountingService.Domain/Aggregates/InvoiceAggregate/InvoiceFrequency.cs
- [ ] T096 [P] [US5] Create InvoiceStatus enum in api/src/AccountingService.Domain/Aggregates/InvoiceAggregate/InvoiceStatus.cs
- [ ] T097 [US5] Create Invoice aggregate root in api/src/AccountingService.Domain/Aggregates/InvoiceAggregate/Invoice.cs
- [ ] T098 [US5] Create InvoiceLineItem entity in api/src/AccountingService.Domain/Aggregates/InvoiceAggregate/InvoiceLineItem.cs
- [ ] T099 [P] [US5] Create InvoiceGenerated domain event in api/src/AccountingService.Domain/Aggregates/InvoiceAggregate/Events/InvoiceGenerated.cs
- [ ] T100 [P] [US5] Create InvoiceIssued domain event in api/src/AccountingService.Domain/Aggregates/InvoiceAggregate/Events/InvoiceIssued.cs
- [ ] T101 [US5] Create IInvoiceGeneratorService interface in api/src/AccountingService.Domain/Services/IInvoiceGeneratorService.cs

### Application Layer for User Story 5

- [ ] T102 [P] [US5] Create InvoiceDto and InvoiceLineItemDto in api/src/AccountingService.Application/DTOs/InvoiceDto.cs
- [ ] T103 [US5] Create GenerateInvoiceCommand in api/src/AccountingService.Application/Commands/GenerateInvoice/GenerateInvoiceCommand.cs
- [ ] T104 [US5] Create GenerateInvoiceCommandHandler in api/src/AccountingService.Application/Commands/GenerateInvoice/GenerateInvoiceCommandHandler.cs
- [ ] T105 [US5] Create GenerateInvoiceValidator with billing period validation in api/src/AccountingService.Application/Commands/GenerateInvoice/GenerateInvoiceValidator.cs
- [ ] T106 [P] [US5] Create GetInvoiceQuery in api/src/AccountingService.Application/Queries/GetInvoice/GetInvoiceQuery.cs
- [ ] T107 [US5] Create GetInvoiceQueryHandler with line items in api/src/AccountingService.Application/Queries/GetInvoice/GetInvoiceQueryHandler.cs
- [ ] T108 [P] [US5] Create ListInvoicesQuery in api/src/AccountingService.Application/Queries/ListInvoices/ListInvoicesQuery.cs
- [ ] T109 [US5] Create ListInvoicesQueryHandler with filtering in api/src/AccountingService.Application/Queries/ListInvoices/ListInvoicesQueryHandler.cs

### Infrastructure Layer for User Story 5

- [ ] T110 [US5] Implement InvoiceGeneratorService with ledger query logic in api/src/AccountingService.Infrastructure/Services/InvoiceGeneratorService.cs
- [ ] T111 [US5] Implement invoice number generation strategy in InvoiceGeneratorService
- [ ] T112 [P] [US5] Create Invoice entity configuration in api/src/AccountingService.Infrastructure/Persistence/Configurations/InvoiceConfiguration.cs
- [ ] T113 [P] [US5] Create InvoiceLineItem entity configuration in api/src/AccountingService.Infrastructure/Persistence/Configurations/InvoiceLineItemConfiguration.cs
- [ ] T114 [US5] Update AccountingDbContext with Invoice and InvoiceLineItem DbSets in api/src/AccountingService.Infrastructure/Persistence/AccountingDbContext.cs
- [ ] T115 [US5] Create migration for Invoice and InvoiceLineItem tables with indexes in api/src/AccountingService.Infrastructure/Persistence/Migrations/
- [ ] T116 [US5] Add unique index for invoice number (TenantId, InvoiceNumber) in migration

### API Layer for User Story 5

- [ ] T117 [US5] Create InvoicesController in api/src/AccountingService.API/Controllers/InvoicesController.cs
- [ ] T118 [US5] Implement POST /v1/invoices endpoint per OpenAPI spec
- [ ] T119 [US5] Implement GET /v1/invoices endpoint with filtering per OpenAPI spec
- [ ] T120 [US5] Implement GET /v1/invoices/{invoiceId} endpoint per OpenAPI spec
- [ ] T121 [US5] Add Location header for created invoices

**Checkpoint**: User Story 5 complete - full invoice generation capability across all frequencies

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T122 [P] Add XML documentation comments to all public APIs in api/src/AccountingService.Domain/
- [ ] T123 [P] Add XML documentation comments to all controllers in api/src/AccountingService.API/Controllers/
- [ ] T124 Verify all database indexes per data-model.md are created in migrations
- [ ] T125 [P] Add comprehensive logging to all command handlers
- [ ] T126 [P] Add comprehensive logging to all query handlers
- [ ] T127 Configure CORS policy for API in api/src/AccountingService.API/Program.cs
- [ ] T128 [P] Add rate limiting middleware in api/src/AccountingService.API/Middleware/RateLimitingMiddleware.cs
- [ ] T129 Implement graceful shutdown handling in api/src/AccountingService.API/Program.cs
- [ ] T130 [P] Create README.md for api/ with setup instructions
- [ ] T131 Validate quickstart.md workflows against implemented API
- [ ] T132 [P] Add Prometheus metrics endpoints per research.md
- [ ] T133 Review and optimize all AsNoTracking() usage for read queries
- [ ] T134 [P] Add OpenTelemetry trace instrumentation to critical paths
- [ ] T135 Configure connection pooling limits per research.md (max 100 connections)
- [ ] T136 [P] Add request/response compression in api/src/AccountingService.API/Program.cs
- [ ] T137 Security audit: Verify tenant isolation in all queries
- [ ] T138 Performance test: Ledger append latency < 100ms target
- [ ] T139 Performance test: Invoice generation < 2 seconds target
- [ ] T140 Create deployment guide with environment variables in api/docs/deployment.md

**Checkpoint**: Production-ready service with observability, performance, and security hardening

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion - also integrates with US1 (Account entity)
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) completion - builds on US2 ledger infrastructure
- **User Story 4 (Phase 6)**: Depends on US2 and US3 completion (needs ledger data to compute balances)
- **User Story 5 (Phase 7)**: Depends on US1, US2, US4 completion (needs accounts, charges, balance calculation)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundational (Phase 2) - MUST COMPLETE FIRST
    ↓
    ├─→ User Story 1 (Accounts) ────────────┐
    │                                       ↓
    ├─→ User Story 2 (Ride Charges) ───→ User Story 4 (Balance/Statements) ───┐
    │           ↓                             ↑                                ↓
    └─→ User Story 3 (Payments) ─────────────┘                          User Story 5 (Invoices)
```

**Recommended Order**:
1. Phase 1 (Setup) → Phase 2 (Foundational) - **Sequential, REQUIRED**
2. User Story 1 → User Story 2 → User Story 3 - **Sequential recommended** (US2/US3 reference Account)
3. User Story 4 after US2+US3 - **Requires ledger data**
4. User Story 5 after US1+US2+US4 - **Requires accounts, charges, balances**
5. Phase 8 (Polish) - **Final**

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T003, T004, T005 (initialize projects) can run in parallel
- T006, T009, T011 (test projects, EditorConfig, appsettings) can run in parallel

**Within Foundational (Phase 2)**:
- T013, T014, T015 (value objects) can run in parallel
- T019, T020 (middleware) can run in parallel
- T024, T026, T027 (behaviors) can run in parallel

**Within Each User Story**:
- All tasks marked [P] within same story can run in parallel
- Example US1: T032+T033 (enums), T037+T038 (DTOs/commands), T041+T043+T045 (additional commands/queries)
- Example US2: T056+T057 (enums), T062+T066 (DTOs), T069+T070 (configurations)

**Across User Stories** (if team capacity allows after Foundational):
- User Story 1 and 2 can start in parallel (different aggregates initially)
- User Story 2 and 3 can proceed in parallel after US1 complete (both work on ledger)

### Within Each User Story Execution

1. **Domain models first** → Provides type safety for application layer
2. **Application layer** → Commands/Queries define contracts
3. **Infrastructure layer** → Implements persistence
4. **API layer** → Exposes REST endpoints
5. **Story validation** → Test independently before next story

### Parallel Example: Foundational Phase

```bash
# Launch in parallel:
- T013: Money value object
- T014: DateRange value object  
- T015: Result pattern classes
- T019: CorrelationIdMiddleware
- T020: ErrorHandlingMiddleware
- T026: ValidationBehavior
- T027: LoggingBehavior

# These work on different files with no dependencies
```

### Parallel Example: User Story 2

```bash
# Launch domain models in parallel:
- T056: TransactionType enum
- T057: LedgerAccountType enum

# Launch DTOs and queries in parallel:
- T062: LedgerTransactionDto
- T066: GetLedgerTransactionQuery

# Launch entity configurations in parallel:
- T069: LedgerTransaction configuration
- T070: LedgerEntry configuration
```

---

## Implementation Strategy

### MVP First (Recommended for Initial Delivery)

**Goal**: Deliver working accounting system with minimum viable features

1. ✅ Complete Phase 1: Setup (T001-T011)
2. ✅ Complete Phase 2: Foundational (T012-T031) - **CRITICAL GATE**
3. ✅ Complete Phase 3: User Story 1 - Accounts (T032-T055)
4. ✅ Complete Phase 4: User Story 2 - Ride Charges (T056-T077)
5. **STOP and VALIDATE**: Test end-to-end workflow:
   - Create account
   - Record ride charge
   - Verify ledger entries balanced
   - Verify idempotency
6. **MVP READY**: Can track charges per account with audit trail

### Incremental Delivery (Full Feature Set)

**After MVP**, add features in priority order:

1. **MVP** (Phases 1-4): Accounts + Ride Charges
2. **+Payments** (Phase 5): Add User Story 3 → Can track payments and receivables
3. **+Balance/Statements** (Phase 6): Add User Story 4 → Can query balances and statements
4. **+Invoicing** (Phase 7): Add User Story 5 → Complete billing system
5. **Production Hardening** (Phase 8): Polish → Production-ready deployment

Each increment is independently testable and deployable.

### Parallel Team Strategy

**With 2-3 developers after Foundational Phase**:

- **Developer A**: User Story 1 (Accounts) - T032-T055
- **Developer B**: User Story 2 (Ride Charges) - T056-T077 (after US1 Account entity exists)
- **Developer C**: Setup integration tests and Docker environment

After initial stories complete:
- **Developer A**: User Story 4 (Balance/Statements)
- **Developer B**: User Story 3 (Payments)
- **Developer C**: User Story 5 (Invoices) after US1+US2+US4 ready

---

## Task Summary

| Phase | Task Count | Can Parallelize | Estimated Effort |
|-------|-----------|----------------|------------------|
| Phase 1: Setup | 11 tasks | 7 tasks | 4-6 hours |
| Phase 2: Foundational | 20 tasks | 10 tasks | 1-2 days |
| Phase 3: US1 - Accounts | 24 tasks | 12 tasks | 2-3 days |
| Phase 4: US2 - Ride Charges | 22 tasks | 9 tasks | 2-3 days |
| Phase 5: US3 - Payments | 8 tasks | 0 tasks | 1 day |
| Phase 6: US4 - Balance/Statements | 9 tasks | 4 tasks | 1-2 days |
| Phase 7: US5 - Invoices | 27 tasks | 11 tasks | 3-4 days |
| Phase 8: Polish | 19 tasks | 11 tasks | 2-3 days |
| **TOTAL** | **140 tasks** | **64 parallelizable** | **12-18 days** |

**MVP Scope** (Phases 1-4): 77 tasks, ~5-8 days
**Full Feature Set** (All phases): 140 tasks, ~12-18 days with parallelization

---

## Notes

- All paths use `api/` prefix per project structure in plan.md
- [P] tasks work on different files and can run simultaneously
- [Story] labels enable tracking work per user story
- Tests not included in this task list (can add unit/integration tests incrementally per .NET TDD practices)
- Commit after each logical task group (e.g., all domain models for a story)
- Each user story checkpoint is independently deployable
- Validate at checkpoints before proceeding to next story
- Double-entry balance validation enforced in TransactionBehavior (T028)
- Multi-tenant isolation enforced via global query filters (T048, T071, etc.)
- Performance targets validated in Phase 8 (T138, T139)
