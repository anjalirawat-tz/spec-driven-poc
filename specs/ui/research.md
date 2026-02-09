# Research: Accounting & Invoicing UI

**Date**: 2026-02-09  
**Phase**: 0 - Technology Research & Architecture Decisions  
**Status**: Complete

---

## Overview

This document captures research findings and architectural decisions for building the Accounting & Invoicing UI. All decisions are made with consideration for maintainability, developer experience, performance, and alignment with the backend API contract.

---

## Decision Summary

| Area | Decision | Rationale |
|------|----------|-----------|
| **Framework** | React 18.3+ | Mature ecosystem, excellent TypeScript support, component model fits requirements |
| **Build Tool** | Vite 5.x | Fast HMR, native ESM, excellent TypeScript support, modern standards |
| **Component Library** | Material-UI (MUI) v5 | Enterprise-ready, excellent data table support, accessible, comprehensive docs |
| **State Management** | React Query + Context API | Server state via React Query (caching, refetching), client state via Context |
| **Routing** | React Router v6 | Standard, mature, excellent TypeScript support |
| **API Client** | Axios | Interceptors for tenant header injection, better error handling than fetch |
| **Formatting** | date-fns + Intl.NumberFormat | Lightweight, tree-shakeable, native currency formatting |
| **Testing** | Jest + RTL + Cypress | Industry standard, excellent React integration, comprehensive coverage |

---

## 1. Framework Choice

### Options Evaluated

#### React 18.3+
**Pros**:
- Largest ecosystem and community support
- Excellent TypeScript integration
- Concurrent features (Suspense, Transitions) for better UX
- Best-in-class component libraries available
- Most familiar to wider developer base

**Cons**:
- Requires decisions on state management, routing, forms
- No opinionated structure (requires architectural discipline)

**Score**: ⭐⭐⭐⭐⭐ (5/5)

#### Angular 17+
**Pros**:
- Opinionated (batteries included: routing, forms, HTTP client)
- Excellent TypeScript support (written in TypeScript)
- Strong enterprise adoption
- RxJS for reactive programming

**Cons**:
- Steeper learning curve
- Heavier bundle size
- More ceremony for simple components

**Score**: ⭐⭐⭐⭐ (4/5)

#### Vue 3 + TypeScript
**Pros**:
- Gentle learning curve
- Excellent documentation
- Good TypeScript support (improved in v3)
- Composition API is elegant

**Cons**:
- Smaller ecosystem than React
- Fewer enterprise-grade component libraries
- Less common in enterprise settings

**Score**: ⭐⭐⭐ (3/5)

### Decision: React 18.3+

**Rationale**: 
- Best balance of developer experience, ecosystem maturity, and performance
- Largest selection of high-quality component libraries (critical for rapid development)
- Excellent TypeScript support meets project requirements
- Concurrent features (Suspense for data fetching) align with performance goals
- Most flexible for future enhancements

---

## 2. Build Tool

### Options Evaluated

#### Vite 5.x
**Pros**:
- Lightning-fast HMR (< 100ms for typical changes)
- Native ESM support (no bundling in dev)
- Excellent TypeScript support out-of-the-box
- Modern, actively maintained
- Smaller config surface area

**Cons**:
- Newer (less battle-tested than Webpack)
- Some legacy plugins may not be compatible

**Score**: ⭐⭐⭐⭐⭐ (5/5)

#### Webpack 5
**Pros**:
- Extremely mature and battle-tested
- Largest plugin ecosystem
- Highly configurable

**Cons**:
- Slower HMR (1-5 seconds typical)
- Complex configuration
- Requires more setup for TypeScript

**Score**: ⭐⭐⭐ (3/5)

#### Create React App (CRA)
**Pros**:
- Zero config for beginners
- Official React team recommendation (historically)

**Cons**:
- Slow build times
- Hidden configuration (ejecting required for customization)
- No longer actively recommended by React team
- Slower HMR than Vite

**Score**: ⭐⭐ (2/5)

### Decision: Vite 5.x

**Rationale**:
- Development speed is critical for rapid iteration
- Out-of-the-box TypeScript support reduces configuration burden
- Modern standard (recommended by React documentation as of 2024)
- Near-instant HMR improves developer experience significantly
- Production builds are optimized via Rollup

---

## 3. Component Library

### Options Evaluated

#### Material-UI (MUI) v5
**Pros**:
- Most comprehensive component library (120+ components)
- Excellent DataGrid component (critical for account/ledger/invoice lists)
- WCAG 2.1 Level AA accessible out-of-the-box
- Mature theming system
- Enterprise adoption (Google, Amazon, etc.)
- Strong TypeScript support

**Cons**:
- Larger bundle size (~300KB minified)
- Opinionated Material Design aesthetic (customizable but requires effort)

**Score**: ⭐⭐⭐⭐⭐ (5/5)

#### Ant Design (antd) v5
**Pros**:
- Excellent component quality
- Strong table/form components
- Good internationalization
- Popular in enterprise apps

**Cons**:
- Less customizable theming than MUI
- Slightly smaller ecosystem
- Design language is more opinionated

**Score**: ⭐⭐⭐⭐ (4/5)

#### Chakra UI v2
**Pros**:
- Excellent developer experience
- Highly composable
- Built-in dark mode
- Accessible by default

**Cons**:
- Smaller component library (fewer specialized components)
- Weaker data table options (critical gap for this project)
- Less enterprise adoption

**Score**: ⭐⭐⭐ (3/5)

### Decision: Material-UI (MUI) v5

**Rationale**:
- **DataGrid component** is critical for account lists, ledger transactions, and invoice lists (handles pagination, sorting, filtering out-of-the-box)
- Accessibility compliance (WCAG 2.1 Level AA) meets NFR-13
- Mature and battle-tested in enterprise applications
- Comprehensive component library reduces custom component development
- Excellent documentation and community support

**Implementation Notes**:
- Use MUI DataGrid Pro for advanced features (if budget allows) or free version with custom pagination
- Customize theme to avoid "Material Design" look if desired
- Tree-shake components to minimize bundle size

---

## 4. State Management

### Options Evaluated

#### React Query + Context API
**Pros**:
- React Query handles all server state (caching, refetching, invalidation)
- Context API for simple client state (tenant, auth context)
- Minimal boilerplate
- Aligns with "no client storage" constraint

**Cons**:
- Two state management approaches (but logically separated)

**Score**: ⭐⭐⭐⭐⭐ (5/5)

#### Redux Toolkit
**Pros**:
- Industry standard
- Excellent DevTools
- Predictable state management

**Cons**:
- Overkill for this project (most state is server-driven)
- More boilerplate than Context API
- Steeper learning curve

**Score**: ⭐⭐⭐ (3/5)

#### Zustand
**Pros**:
- Lightweight and simple
- No boilerplate
- Good TypeScript support

**Cons**:
- Doesn't solve server state caching (needs additional library)
- Less community adoption

**Score**: ⭐⭐⭐ (3/5)

### Decision: React Query + Context API

**Rationale**:
- **React Query** is purpose-built for server state management (perfect for API-driven UI)
- Automatic caching, refetching, and stale-while-revalidate patterns improve performance
- Reduces API calls and improves perceived performance
- **Context API** is sufficient for client state (tenant ID, authentication context)
- Minimal learning curve and boilerplate
- Aligns with "stateless client" constraint (no persistent local storage)

**Implementation Notes**:
- React Query for all API data (accounts, ledger, invoices)
- Context API for tenant and theme state
- No Redux/Zustand needed

---

## 5. Routing

### Decision: React Router v6

**Rationale**:
- De facto standard for React routing
- Excellent TypeScript support
- Declarative routing matches React's mental model
- Nested routes for Account Detail tabs (Summary, Transactions, Invoices)
- Code splitting support for performance

**Alternative Considered**: TanStack Router (new, but less mature)

---

## 6. API Client

### Options Evaluated

#### Axios
**Pros**:
- Interceptors for global tenant header injection
- Better error handling than fetch
- Request/response transformation
- Automatic JSON parsing
- Timeout support
- Wide adoption

**Cons**:
- Small bundle size cost (~13KB minified)

**Score**: ⭐⭐⭐⭐⭐ (5/5)

#### Native Fetch API
**Pros**:
- No bundle size cost (native)
- Modern standard

**Cons**:
- Requires manual interceptor implementation
- No automatic JSON parsing
- No timeout support (requires AbortController)
- More verbose error handling

**Score**: ⭐⭐⭐ (3/5)

### Decision: Axios

**Rationale**:
- **Interceptors** are critical for injecting `X-Tenant-ID` header on every request
- Better error handling reduces boilerplate in components
- Timeout support improves reliability
- Small bundle cost is justified by reduced code complexity

**Implementation Notes**:
```typescript
// Create base client with tenant interceptor
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const tenantId = getTenantIdFromContext();
  config.headers['X-Tenant-ID'] = tenantId;
  return config;
});
```

---

## 7. Formatting Libraries

### Date Formatting

**Decision**: date-fns v3

**Rationale**:
- Lightweight (tree-shakeable, import only functions used)
- TypeScript support
- Functional API (easy to test)
- Locale support for future internationalization

**Alternative Considered**: Moment.js (deprecated, large bundle), Day.js (smaller ecosystem)

### Currency Formatting

**Decision**: Intl.NumberFormat (native)

**Rationale**:
- Native browser API (no bundle cost)
- Locale-aware (USD formatting built-in)
- Meets project requirement (USD-only)

**Implementation**:
```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
```

---

## 8. Testing Strategy

### Unit Testing: Jest + React Testing Library (RTL)

**Rationale**:
- Jest is the de facto standard for React testing
- RTL encourages testing from user perspective (accessibility-focused)
- Excellent TypeScript support
- Fast test execution

**Coverage Target**: 80% for business logic, 60% for components

### Integration Testing: MSW (Mock Service Worker)

**Rationale**:
- Mock API responses at network level (transparent to components)
- Test API client functions with realistic scenarios
- No backend dependency for tests

### E2E Testing: Cypress v13

**Rationale**:
- Industry standard for E2E testing
- Excellent developer experience
- Visual regression testing support
- TypeScript support

**Critical Workflows to Test**:
1. Review account balance (FR-1, FR-2, FR-3)
2. Investigate invoice (FR-7, FR-8, FR-9)
3. Update invoice metadata (FR-10)

---

## 9. Form Management

### Decision: React Hook Form v7

**Rationale**:
- Minimal re-renders (performance)
- Excellent validation support
- Works well with MUI components
- TypeScript-first

**Use Cases**:
- Invoice metadata editing form
- Ledger transaction filters form

---

## 10. Authentication & Tenant Context

### Assumption

Authentication is handled by an external auth service (JWT token in localStorage/cookie). Tenant ID is extracted from JWT claims.

**Implementation Approach**:
```typescript
// TenantContext.tsx
const TenantContext = React.createContext<TenantContextType>(null);

export function TenantProvider({ children }) {
  const tenantId = extractTenantIdFromJWT();
  return (
    <TenantContext.Provider value={{ tenantId }}>
      {children}
    </TenantContext.Provider>
  );
}
```

---

## 11. Performance Optimizations

### Lazy Loading

- React.lazy() for route-based code splitting
- Load Account Detail, Invoice Detail only when navigated

### Pagination

- MUI DataGrid handles virtual scrolling for large lists
- Backend pagination for account/invoice lists (per API contract)

### Memoization

- React.memo for expensive components (e.g., ledger transaction rows)
- useMemo for expensive computations (e.g., balance calculations if done client-side)

---

## 12. Accessibility (WCAG 2.1 Level AA)

### Strategy

- MUI components are accessible by default
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Ensure keyboard navigation for all actions
- Color contrast ratios meet 4.5:1 (text) and 3:1 (large text)
- ARIA labels for icon-only buttons

### Tools

- axe DevTools for automated accessibility testing
- Lighthouse for auditing

---

## 13. Internationalization (Future)

While v1 is USD-only, architecture supports internationalization:
- date-fns has locale support
- Intl.NumberFormat supports multiple currencies
- React i18next for text translation (future)

---

## 14. Deployment & Build

### Build Output

- Static files (HTML, JS, CSS) deployed to CDN or static hosting
- Environment variables via Vite's import.meta.env

### Hosting Options

- Netlify (simplest for SPA)
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps

### CI/CD

- Build on push to main
- Run tests (unit + E2E) before deployment
- Deploy to staging on PR, production on merge

---

## 15. Dependencies Summary

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@mui/x-data-grid": "^6.19.0",
    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.51.0",
    "date-fns": "^3.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "cypress": "^13.6.0",
    "msw": "^2.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## 16. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              React Application                      │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Pages (Routes)                          │     │    │
│  │  │  - AccountList                            │     │    │
│  │  │  - AccountDetail (Tabs)                   │     │    │
│  │  │  - InvoiceDetail                          │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                   ↓                                 │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Components (MUI)                        │     │    │
│  │  │  - AccountTable, LedgerTable             │     │    │
│  │  │  - InvoiceDetail, InvoiceMetadataForm    │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                   ↓                                 │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Hooks / State Management                │     │    │
│  │  │  - useAccounts (React Query)             │     │    │
│  │  │  - useLedger (React Query)               │     │    │
│  │  │  - useInvoices (React Query)             │     │    │
│  │  │  - TenantContext                          │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                   ↓                                 │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  API Client (Axios)                      │     │    │
│  │  │  - Base client with X-Tenant-ID header  │     │    │
│  │  │  - accounts.ts, ledger.ts, invoices.ts  │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
│                       ↓                                      │
│              HTTPS (REST API)                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│           Accounting Service API (Backend)                   │
│           - GET /api/v1/accounts                            │
│           - GET /api/v1/ledger/transactions                 │
│           - GET /api/v1/invoices                            │
│           - PATCH /api/v1/invoices/{id}                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 17. Security Considerations

### Tenant Isolation

- **Client-Side**: X-Tenant-ID header on every request (enforced by Axios interceptor)
- **Backend-Side**: API validates tenant boundary (no UI can bypass this)

### XSS Prevention

- React escapes all user input by default
- Avoid dangerouslySetInnerHTML

### HTTPS Only

- All production deployments use HTTPS
- Backend API must use HTTPS

### Authentication

- JWT token stored in httpOnly cookie (recommended) or localStorage
- Token refresh handled by auth service
- Expired token redirects to login

---

## 18. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large data volumes exceed performance targets | Medium | Implement virtual scrolling (MUI DataGrid), backend pagination, lazy loading |
| Backend API contract changes | High | Use TypeScript interfaces generated from OpenAPI spec, integration tests |
| Browser compatibility issues | Low | Use Vite's automatic polyfills, test on target browsers |
| Accessibility violations | Medium | Use MUI's accessible components, run axe DevTools audits, manual testing |
| Bundle size exceeds acceptable limits | Low | Tree-shaking, code splitting, monitor with Vite Bundle Analyzer |

---

## 19. Timeline Impact

Research phase confirms **7-week estimate** from spec is realistic:
- **Phase 1 (MVP)**: 5 weeks (all P1 features)
- **Phase 2 (P2 features)**: 1 week
- **Phase 3 (Polish)**: 1 week

Technology stack choices minimize boilerplate and leverage existing solutions (MUI DataGrid, React Query), reducing custom development time.

---

## Conclusion

All technology decisions are made with consideration for:
✅ **Developer Experience**: Modern tooling (Vite, TypeScript, React Query)  
✅ **Performance**: Lightweight bundle, efficient caching, lazy loading  
✅ **Maintainability**: Standard patterns, comprehensive documentation  
✅ **Accessibility**: WCAG 2.1 Level AA compliance via MUI  
✅ **Scalability**: Pagination, virtual scrolling, code splitting  

The chosen stack (React + Vite + MUI + React Query + Axios) is battle-tested, well-documented, and aligns with project requirements.

**Next Phase**: Data Model & Component Architecture (Phase 1)
