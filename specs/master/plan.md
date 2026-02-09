# Implementation Plan: Dual-Entry Accounting & Invoicing Service

**Branch**: `master` | **Date**: 2026-02-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/master/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a **double-entry accounting and invoicing service** that serves as the financial system of record for ride-based billing. The service will record charges and payments using immutable ledger entries, compute account balances, and generate invoices at multiple frequencies (per-ride, daily, weekly, monthly) with full traceability from rides to ledger to invoices.

## Technical Context

**Language/Version**: .NET 8.0 (C# 12)  
**Primary Dependencies**: NEEDS CLARIFICATION (ASP.NET Core, EF Core, MediatR, FluentValidation candidates)  
**Storage**: PostgreSQL (strong consistency required for ledger, multi-tenant isolation)  
**Testing**: xUnit, Testcontainers (for integration tests), NEEDS CLARIFICATION (mocking framework)  
**Target Platform**: Linux container (Docker/Kubernetes)
**Project Type**: Web API (RESTful service)  
**Performance Goals**: 
  - Ledger append latency < 100ms (per spec)
  - Invoice generation < 2 seconds (per spec)
  - NEEDS CLARIFICATION (concurrent request throughput)
**Constraints**: 
  - Fixed-point decimal arithmetic (financial accuracy)
  - Strong consistency for ledger writes
  - Multi-tenant data isolation (row-level security or schema-per-tenant)
  - Immutable ledger (append-only, no updates/deletes)
  - Idempotent operations (ride charges, payment recording)
**Scale/Scope**: 
  - Multi-tenant SaaS
  - NEEDS CLARIFICATION (expected tenant count, transactions per tenant per day)
  - Horizontally scalable for reads (per spec)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template constitution found - project-specific principles not yet defined.

### Preliminary Architectural Compliance

Based on general software engineering best practices and requirements analysis:

✅ **Pass**: Single service boundary (accounting/invoicing domain)  
✅ **Pass**: Clear external dependencies (ride service, payment service are upstream)  
✅ **Pass**: RESTful API interface defined  
⚠️ **Review Required**: Multi-tenancy strategy (schema vs row-level vs database per tenant)  
⚠️ **Review Required**: Resilience patterns for ledger consistency (retry, idempotency keys)  
⚠️ **Review Required**: Testing strategy (unit, integration, contract tests for ledger accuracy)

**Action**: Will establish project-specific constitution principles in Phase 0 research based on .NET distributed systems best practices.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
api/
├── src/
│   ├── AccountingService.Domain/          # Domain entities, value objects, domain services
│   ├── AccountingService.Application/     # Use cases, DTOs, interfaces
│   ├── AccountingService.Infrastructure/  # EF Core, repositories, external integrations
│   └── AccountingService.API/             # REST controllers, middleware, startup
└── tests/
    ├── AccountingService.Domain.Tests/         # Unit tests for domain logic
    ├── AccountingService.Application.Tests/    # Unit tests for use cases
    ├── AccountingService.IntegrationTests/     # Integration tests with Testcontainers
    └── AccountingService.ContractTests/        # API contract tests

specs/
└── master/
    ├── plan.md              # This file
    ├── research.md          # Phase 0 output
    ├── data-model.md        # Phase 1 output
    ├── quickstart.md        # Phase 1 output
    └── contracts/           # Phase 1 output (OpenAPI specs)
```

**Structure Decision**: Using Clean Architecture with DDD for the accounting service:
- **Domain layer**: Core business logic (Account, Ledger, LedgerEntry aggregates)
- **Application layer**: Use cases (RecordRideCharge, RecordPayment, GenerateInvoice)
- **Infrastructure layer**: EF Core DbContext, PostgreSQL implementation
- **API layer**: ASP.NET Core controllers and middleware

This structure aligns with financial domain complexity and need for strong consistency guarantees.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No constitution violations detected at this stage. Will re-evaluate after Phase 1 design.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
