# Implementation Plan: Accounting & Invoicing UI

**Branch**: `ui` | **Date**: 2026-02-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a **tenant-scoped web application** for the Dual-Entry Accounting Service that provides transparent visibility into accounts, ledger transactions, and invoices. The UI is a pure client application that retrieves all data from the Accounting Service REST API and enforces read-only access to financial data while allowing metadata updates.

## Technical Context

**Language/Version**: TypeScript 5.x with Angular 17+  
**Primary Dependencies**: Angular 17+, TypeScript, RxJS, HttpClient, Angular Material  
**Storage**: None (stateless client app - all data from API)  
**Testing**: Jasmine + Karma for unit tests, Cypress for E2E  
**Target Platform**: Modern web browsers (Chrome 100+, Firefox 100+, Edge 100+, Safari 15+)  
**Project Type**: Single-page web application (SPA)  
**Performance Goals**: 
  - Account list load < 2 seconds (1000 accounts)
  - Ledger list load < 2 seconds (90 days, ~500 transactions)
  - Invoice list load < 1 second (~100 invoices)
  - Page transitions < 300ms
**Constraints**: 
  - Pure client application (no backend-for-frontend)
  - Read-only ledger access (no financial data mutations)
  - Strong tenant isolation (X-Tenant-ID header)
  - Desktop-first responsive (1280px+ primary)
  - WCAG 2.1 Level AA accessibility
**Scale/Scope**: 
  - Typical account: <10,000 transactions, <1,000 invoices
  - Expected concurrent users per tenant: 5-20
  - Multi-tenant SaaS (tenant context from authentication)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template constitution found - project-specific principles not yet defined for UI.

### Preliminary Architecture Compliance

Based on general web application best practices and requirements analysis:

✅ **Pass**: Single client application (no backend-for-frontend complexity)  
✅ **Pass**: Clear API contract with backend (REST API documented in OpenAPI spec)  
✅ **Pass**: Read-only financial data access (enforces data integrity)  
✅ **Pass**: Stateless architecture (no client-side storage of sensitive data)  
✅ **Pass**: Framework choice (Angular 17+ for enterprise-grade SPA)  
✅ **Pass**: State management strategy (RxJS + Services with dependency injection)  
✅ **Pass**: Component-based architecture (standard for modern SPAs)  
✅ **Pass**: Accessibility compliance target (WCAG 2.1 Level AA)

**Action**: Will establish UI-specific architecture principles in Phase 0 research based on modern SPA best practices.

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
ui/
├── src/
│   ├── app/
│   │   ├── core/                  # Core module (singleton services)
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts          # Base HTTP service with tenant header
│   │   │   │   ├── account.service.ts      # Account API endpoints
│   │   │   │   ├── ledger.service.ts       # Ledger transaction endpoints
│   │   │   │   ├── invoice.service.ts      # Invoice endpoints
│   │   │   │   └── tenant.service.ts       # Tenant context service
│   │   │   ├── interceptors/
│   │   │   │   └── tenant.interceptor.ts   # Inject X-Tenant-ID header
│   │   │   └── core.module.ts
│   │   ├── shared/                # Shared module (reusable components)
│   │   │   ├── components/
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── error-alert/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── status-badge/
│   │   │   │   └── currency-display/
│   │   │   ├── pipes/
│   │   │   │   ├── currency-format.pipe.ts
│   │   │   │   └── date-format.pipe.ts
│   │   │   └── shared.module.ts
│   │   ├── features/               # Feature modules
│   │   │   ├── accounts/
│   │   │   │   ├── components/
│   │   │   │   │   ├── account-list/
│   │   │   │   │   ├── account-detail/
│   │   │   │   │   ├── account-filters/
│   │   │   │   │   └── account-table/
│   │   │   │   ├── accounts-routing.module.ts
│   │   │   │   └── accounts.module.ts
│   │   │   ├── ledger/
│   │   │   │   ├── components/
│   │   │   │   ├── ledger-routing.module.ts
│   │   │   │   └── ledger.module.ts
│   │   │   └── invoices/
│   │   │       ├── components/
│   │   │       ├── invoices-routing.module.ts
│   │   │       └── invoices.module.ts
│   │   ├── models/                # TypeScript interfaces and types
│   │   │   ├── account.model.ts
│   │   │   ├── ledger-transaction.model.ts
│   │   │   ├── invoice.model.ts
│   │   │   └── common.model.ts
│   │   ├── utils/                 # Utility functions
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── app-routing.module.ts  # Root routing
│   │   ├── app.component.ts       # Root component
│   │   ├── app.component.html
│   │   ├── app.module.ts          # Root module
│   │   └── app.config.ts          # Application configuration
│   ├── assets/                    # Static assets
│   ├── environments/              # Environment configurations
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts                    # Application entry point
│   └── styles.scss                # Global styles
├── public/                   # Static assets
│   ├── index.html
│   └── favicon.ico
├── tests/
│   ├── unit/                 # Component and utility tests
│   ├── integration/          # API client integration tests
│   └── e2e/                  # Cypress end-to-end tests
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TypeScript config
├── tsconfig.spec.json        # Test TypeScript config
├── angular.json              # Angular CLI configuration
├── karma.conf.js             # Karma test runner configuration
└── README.md                 # Setup and deployment instructions
```

**Structure Decision**: Using **Angular 17+** single-page application (SPA) with modular architecture. Feature modules (accounts, ledger, invoices) are lazy-loaded for performance. Core module contains singleton services (API clients, tenant context). Shared module contains reusable components and pipes. HttpClient with interceptors handles tenant header injection. RxJS observables for reactive data flow. TypeScript for type safety across the entire codebase.
**Status**: No constitution violations detected at this stage. Architecture follows standard SPA patterns with minimal complexity. Will re-evaluate after Phase 1 design if any architectural trade-offs require justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
