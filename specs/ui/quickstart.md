# Quick Start: Accounting & Invoicing UI

**Date**: 2026-02-09  
**Tech Stack**: React 18 + Vite 5 + TypeScript + Material-UI  
**Backend Dependency**: Accounting Service API

---

## Prerequisites

- **Node.js**: v18.x or higher (LTS recommended)
- **npm**: v9.x or higher (or yarn/pnpm)
- **Backend API**: Accounting Service must be running (see `specs/master/quickstart.md`)

---

## Initial Setup

### 1. Create React + Vite Project

```bash
# Navigate to project root
cd ui/

# Create Vite project with React + TypeScript template
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install
```

### 2. Install Core Dependencies

```bash
# UI Framework & Components
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @mui/x-data-grid

# Routing
npm install react-router-dom

# State Management & API
npm install @tanstack/react-query axios

# Forms
npm install react-hook-form

# Date Utilities
npm install date-fns

# TypeScript types
npm install --save-dev @types/node
```

### 3. Install Development Tools

```bash
# Testing
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event @testing-library/dom
npm install --save-dev cypress msw

# Linting & Formatting
npm install --save-dev eslint @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier

# Build Analysis
npm install --save-dev rollup-plugin-visualizer
```

---

## Configuration

### 1. Environment Variables

Create `.env.local` file in `ui/` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api/v1

# Tenant ID (for development - in production, extract from JWT)
VITE_DEV_TENANT_ID=your-tenant-uuid-here
```

**Production**: Create `.env.production` with production API URL.

### 2. TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Vite Configuration

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

### 4. ESLint Configuration

Create `.eslintrc.cjs`:

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};
```

### 5. Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## Project Structure

Create the following directory structure (see `data-model.md` for complete architecture):

```bash
ui/
├── src/
│   ├── api/                  # API client functions
│   │   ├── client.ts        # Axios base client
│   │   ├── accounts.ts      # Account API endpoints
│   │   ├── ledger.ts        # Ledger API endpoints
│   │   └── invoices.ts      # Invoice API endpoints
│   ├── components/          # Reusable components
│   │   ├── common/          # Shared UI components
│   │   ├── accounts/
│   │   ├── ledger/
│   │   └── invoices/
│   ├── pages/               # Page components (routes)
│   │   ├── AccountListPage.tsx
│   │   ├── AccountDetailPage.tsx
│   │   ├── InvoiceDetailPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAccounts.ts
│   │   ├── useLedger.ts
│   │   └── useInvoices.ts
│   ├── models/              # TypeScript interfaces
│   │   ├── Account.ts
│   │   ├── LedgerTransaction.ts
│   │   └── Invoice.ts
│   ├── utils/               # Utility functions
│   │   ├── formatters.ts    # Currency, date formatting
│   │   └── validators.ts
│   ├── context/             # React Context providers
│   │   └── TenantContext.tsx
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── routes.tsx           # Route configuration
├── public/
│   └── index.html
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local               # Local environment variables
├── .env.production          # Production environment variables
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Development Workflow

### 1. Start Backend API

Ensure the Accounting Service API is running:

```bash
# In api/ directory
cd api/src/AccountingService.API
dotnet run

# API should be available at http://localhost:5000
```

### 2. Start Development Server

```bash
# In ui/ directory
npm run dev
```

This starts the Vite dev server at `http://localhost:3000` with:
- Hot Module Replacement (HMR) for instant updates
- TypeScript type checking
- API proxy to backend

### 3. Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (unit + integration)
npm test

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

---

## Implementation Steps (MVP)

Follow these steps to build the MVP (Priority P1 features):

### Phase 1: Setup (Day 1)

1. Create project structure (see above)
2. Set up API client with tenant header injection
3. Create TypeScript models (Account, LedgerTransaction, Invoice)
4. Set up React Router with basic routes
5. Create Layout component with header

### Phase 2: Account List & Detail (Week 1)

6. Implement AccountListPage with MUI DataGrid
7. Implement useAccounts hook (React Query)
8. Add search, filter, pagination
9. Implement AccountDetailPage with tabs
10. Implement AccountSummaryTab (metadata display)

### Phase 3: Ledger Transactions (Week 2)

11. Implement AccountTransactionsTab
12. Create LedgerTable component (MUI DataGrid)
13. Implement useLedgerTransactions hook
14. Add date range, transaction type filters
15. Implement LedgerDetailModal (optional P2 feature)

### Phase 4: Invoices (Week 3)

16. Implement AccountInvoicesTab
17. Create InvoiceTable component
18. Implement useInvoices hook
19. Implement InvoiceDetailPage
20. Add invoice PDF download functionality

### Phase 5: Testing & Polish (Week 4-5)

21. Write unit tests for utilities and API clients
22. Write integration tests with MSW mocks
23. Write Cypress E2E tests for critical workflows
24. Accessibility audit (WCAG 2.1 Level AA)
25. Performance optimization (code splitting, memoization)

---

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

Example test:

```typescript
// src/utils/formatters.test.ts
import { formatCurrency, formatDate } from './formatters';

describe('formatCurrency', () => {
  it('formats USD amounts correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats ISO dates correctly', () => {
    expect(formatDate('2026-02-09T12:00:00Z')).toBe('Feb 9, 2026');
  });
});
```

### Integration Tests (MSW)

Mock API responses at network level:

```typescript
// src/tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/accounts', () => {
    return HttpResponse.json({
      accounts: [
        { id: '123', name: 'Test Account', currentBalance: 1000 },
      ],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 1 },
    });
  }),
];
```

### E2E Tests (Cypress)

```bash
# Open Cypress UI
npm run cypress:open

# Run Cypress headlessly
npm run cypress:run
```

Example E2E test:

```typescript
// cypress/e2e/account-list.cy.ts
describe('Account List', () => {
  beforeEach(() => {
    cy.visit('/accounts');
  });

  it('displays accounts table', () => {
    cy.get('[data-testid="account-table"]').should('be.visible');
    cy.get('[data-testid="account-row"]').should('have.length.greaterThan', 0);
  });

  it('navigates to account detail', () => {
    cy.get('[data-testid="account-row"]').first().click();
    cy.url().should('include', '/accounts/');
    cy.get('[data-testid="account-summary"]').should('be.visible');
  });
});
```

---

## Build & Deploy

### Build for Production

```bash
# Create optimized production build
npm run build

# Output: dist/ directory with static files
```

Build output:
- `dist/index.html` - Entry point
- `dist/assets/` - JS, CSS bundles (with content hashes)

### Deploy to Hosting

#### Option 1: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option 3: AWS S3 + CloudFront

```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## Environment-Specific Configuration

### Development (.env.local)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_DEV_TENANT_ID=dev-tenant-123
```

### Production (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
```

**Note**: In production, tenant ID is extracted from JWT, not environment variables.

---

## Troubleshooting

### Issue: API requests fail with CORS error

**Solution**: Ensure backend API enables CORS for the UI origin:

```csharp
// In AccountingService.API/Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowUI", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://yourdomain.com")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

app.UseCors("AllowUI");
```

### Issue: X-Tenant-ID header not sent

**Solution**: Check Axios interceptor in `src/api/client.ts`:

```typescript
apiClient.interceptors.request.use((config) => {
  const tenantId = getTenantId();
  if (!tenantId) {
    console.error('Tenant ID not found');
  }
  config.headers['X-Tenant-ID'] = tenantId;
  return config;
});
```

### Issue: Build fails with TypeScript errors

**Solution**: Run type check and fix errors:

```bash
npm run type-check
```

### Issue: Slow development server

**Solution**: Vite is usually fast. If slow:
- Clear `node_modules/.vite` cache
- Restart dev server
- Check for large node_modules directory

---

## Performance Optimization

### Code Splitting

Use React.lazy() for route-based splitting:

```typescript
const AccountDetailPage = React.lazy(() => import('./pages/AccountDetailPage'));
const InvoiceDetailPage = React.lazy(() => import('./pages/InvoiceDetailPage'));
```

### Bundle Analysis

Analyze bundle size:

```bash
# Build with bundle analyzer
npm run build -- --analyze

# Opens visual bundle size report
```

### Memoization

Use React.memo for expensive components:

```typescript
const AccountRow = React.memo(({ account }: { account: Account }) => {
  return <TableRow>...</TableRow>;
});
```

---

## Next Steps

1. **Implement MVP**: Follow Phase 1-4 implementation steps
2. **Test**: Write unit, integration, and E2E tests
3. **Accessibility Audit**: Run axe DevTools, manual screen reader testing
4. **Performance Audit**: Run Lighthouse, optimize based on findings
5. **Deploy**: Choose hosting platform and deploy production build

---

## Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **MUI Docs**: https://mui.com/material-ui/getting-started/
- **React Query Docs**: https://tanstack.com/query/latest
- **React Router Docs**: https://reactrouter.com/en/main
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Backend API Spec**: `specs/master/contracts/accounting-api.yaml`

---

## Metrics & Success Criteria

**Performance Targets**:
- ✅ Account list loads < 2 seconds (1000 accounts)
- ✅ Ledger list loads < 2 seconds (90 days)
- ✅ Invoice list loads < 1 second
- ✅ Page transitions < 300ms

**Accessibility**:
- ✅ WCAG 2.1 Level AA compliant
- ✅ Lighthouse accessibility score > 90

**Testing**:
- ✅ 80%+ code coverage for business logic
- ✅ All P1 critical workflows covered by E2E tests

**Date**: 2026-02-09  
**Status**: Ready for Implementation
