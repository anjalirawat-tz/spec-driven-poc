# Research: Dual-Entry Accounting & Invoicing Service

**Date**: 2026-02-09  
**Phase**: 0 - Technical Research & Clarifications  
**Status**: Complete

---

## Research Summary

This document resolves all NEEDS CLARIFICATION items from the Technical Context and establishes technology choices, architectural patterns, and performance baselines for the accounting service.

---

## 1. Technology Stack Selection

### 1.1 Primary Dependencies

**Decision**: 
- **ASP.NET Core 8.0** - Web API framework
- **Entity Framework Core 8.0** - ORM with PostgreSQL provider
- **MediatR 12.x** - CQRS pattern implementation
- **FluentValidation 11.x** - Input validation
- **Polly 8.x** - Resilience patterns (retry, circuit breaker, timeout)
- **Serilog** - Structured logging
- **OpenTelemetry** - Distributed tracing and metrics

**Rationale**:
- **MediatR**: Decouples API layer from application logic, enables cross-cutting concerns (validation, logging, transactions)
- **FluentValidation**: Separates validation rules from domain logic, supports complex financial validation scenarios
- **Polly**: Required for resilience patterns (per .NET production-grade mandate)
- **Serilog**: Industry-standard structured logging with correlation ID support
- **OpenTelemetry**: Cloud-native observability with vendor-neutral instrumentation

**Alternatives Considered**:
- **Direct controller → service pattern**: Rejected - leads to fat controllers, difficult to test, no cross-cutting concern pipeline
- **Data Annotations for validation**: Rejected - insufficient for complex domain validation (e.g., "Debit must equal Credit in double-entry")
- **Manual retry logic**: Rejected - error-prone, Polly provides battle-tested patterns

---

### 1.2 Testing Framework

**Decision**:
- **xUnit** - Test runner
- **NSubstitute** - Mocking framework
- **FluentAssertions** - Assertion library
- **Testcontainers** - Integration testing with real PostgreSQL
- **Respawn** - Database cleanup between integration tests
- **WireMock.Net** - HTTP mocking for contract tests

**Rationale**:
- **NSubstitute**: Cleaner syntax than Moq, better support for C# 12 features
- **FluentAssertions**: Readable test assertions, especially for complex object graphs (ledger entries)
- **Testcontainers**: Real database in tests eliminates EF Core in-memory provider issues, critical for ledger consistency tests
- **Respawn**: Fast database cleanup strategy (checkpoint-based, faster than recreating database)

**Alternatives Considered**:
- **Moq**: Rejected - NSubstitute has cleaner API and better async support
- **EF In-Memory provider**: Rejected - doesn't enforce referential integrity or transaction behavior

---

## 2. Multi-Tenancy Strategy

### 2.1 Multi-Tenant Isolation Approach

**Decision**: **Row-Level Security with Tenant ID**

**Implementation**:
```csharp
// Every entity
public abstract class TenantEntity
{
    public Guid TenantId { get; private set; } // Set once, never changed
}

// Global query filter in DbContext
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Account>().HasQueryFilter(a => a.TenantId == _currentTenant.Id);
    modelBuilder.Entity<LedgerEntry>().HasQueryFilter(e => e.TenantId == _currentTenant.Id);
    // ...
}
```

**Rationale**:
- **Scalability**: Single database scales to 1000s of tenants before sharding needed
- **Cost**: No per-tenant database/schema overhead
- **Backups**: Single backup strategy
- **Migrations**: Apply once, not per-tenant
- **Query performance**: Indexed `TenantId` column performs well
- **Data isolation**: EF Core global query filters prevent cross-tenant leakage

**Alternatives Considered**:

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Database-per-tenant | Strongest isolation, easy per-tenant backups | High cost, migration complexity, connection pool exhaustion | ❌ Over-engineered for initial scale |
| Schema-per-tenant | Good isolation, shared database | Migration complexity (N schemas × M migrations), connection management | ❌ Added complexity without clear benefit |
| Row-level (chosen) | Cost-effective, simple migrations, good performance | Requires discipline in queries | ✅ Best for SaaS at scale |

**Risk Mitigation**:
- Automated tests for tenant isolation (integration tests verify filter enforcement)
- Code review checklist item: "Does this query respect TenantId filter?"
- Future: PostgreSQL Row-Level Security policies as defense-in-depth

---

## 3. Performance & Scale Benchmarks

### 3.1 Throughput Targets

**Decision**: 
- **Concurrent requests**: 500 req/s per instance (P95 < 200ms)
- **Ledger append**: < 100ms (per spec)
- **Invoice generation**: < 2 seconds (per spec)
- **Read queries**: < 50ms for balance lookups, < 200ms for invoice generation queries

**Rationale**:
- Ledger writes are CPU/IO-bound (database write + dual entry validation)
- Invoice queries are read-heavy (JOIN rides + ledger entries + payments)
- Horizontal scaling handles load spikes (Kubernetes HPA based on CPU/request rate)

**Implementation Strategy**:
- **Write path**: Optimistic concurrency for account balance updates
- **Read path**: Indexed queries, `AsNoTracking()`, projection-only queries
- **Bulk operations**: `Task.WhenAll` for parallel processing (per .NET mandate)

---

### 3.2 Expected Scale

**Decision** (Baseline assumptions):
- **Tenant count**: 100-500 tenants initially, plan for 5,000
- **Transactions per tenant per day**: 
  - Small tenant (individual): 1-10 rides/day
  - Medium tenant (small organization): 50-200 rides/day
  - Large tenant (enterprise): 500-2,000 rides/day
- **Total daily volume**: ~50,000 ledger entries/day (25,000 ride charges)
- **Invoice generation**: Peak at month-end (all monthly invoices), ~10,000 invoices generated in 4-hour window

**Rationale**:
- Based on typical ride-sharing volume patterns
- Month-end spike is manageable with background job processing
- Allows 10x growth before architectural changes needed

**Alternatives Considered**:
- **Event sourcing**: Rejected for v1.0 - double-entry ledger already provides audit trail, ES adds complexity
- **CQRS with separate read database**: Rejected for v1.0 - strong consistency requirement, premature optimization

---

## 4. Financial Precision & Ledger Integrity

### 4.1 Decimal Type Selection

**Decision**: Use `decimal` type (C# native) mapped to PostgreSQL `NUMERIC(19,4)`

**Rationale**:
- **Precision**: 4 decimal places handles sub-cent calculations (e.g., splits, discounts in future)
- **Range**: 19 digits total handles amounts up to $999 trillion (sufficient for ride fares)
- **Performance**: `decimal` is optimized in .NET, PostgreSQL NUMERIC is standard for financial data
- **No floating-point errors**: Critical for accounting correctness

**Implementation**:
```csharp
[Column(TypeName = "decimal(19,4)")]
public decimal Amount { get; private set; }
```

**Alternatives Considered**:
- **Integer (cents)**: Rejected - harder to read, doesn't handle sub-cent precision
- **double/float**: ❌ FORBIDDEN - floating-point errors break accounting

---

### 4.2 Ledger Consistency Guarantees

**Decision**: **Database transaction per ride charge + payment with debit/credit balance check**

**Implementation**:
```csharp
// MediatR pipeline behavior
public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
{
    public async Task<TResponse> Handle(/* ... */)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var response = await next();
            
            // Validate double-entry balance
            var unbalanced = await _dbContext.LedgerEntries
                .Where(e => e.TransactionId == transactionId)
                .GroupBy(e => e.TransactionId)
                .Select(g => new { Sum = g.Sum(e => e.Debit - e.Credit) })
                .FirstOrDefaultAsync();
            
            if (unbalanced?.Sum != 0)
                throw new LedgerImbalanceException("Debit != Credit");
            
            await transaction.CommitAsync();
            return response;
        }
        catch { await transaction.RollbackAsync(); throw; }
    }
}
```

**Rationale**:
- **Atomicity**: Both ledger entries (Debit Receivable + Credit Revenue) committed together or not at all
- **Consistency**: Balance check enforces double-entry invariant
- **Isolation**: PostgreSQL serializable isolation prevents concurrent modification anomalies
- **Durability**: PostgreSQL WAL ensures committed transactions survive crashes

**Alternatives Considered**:
- **Application-level validation only**: ❌ Rejected - race conditions possible
- **Eventual consistency**: ❌ Rejected - financial ledger requires strong consistency

---

## 5. Idempotency Strategy

### 5.1 Idempotency Key Implementation

**Decision**: **Idempotency key = Ride ID for charges, Payment Reference ID for payments**

**Implementation**:
```csharp
// Unique index
modelBuilder.Entity<LedgerTransaction>()
    .HasIndex(t => new { t.TenantId, t.IdempotencyKey })
    .IsUnique();

// Use case
public async Task<Result> Handle(RecordRideChargeCommand request)
{
    var existing = await _dbContext.LedgerTransactions
        .FirstOrDefaultAsync(t => 
            t.TenantId == request.TenantId && 
            t.IdempotencyKey == request.RideId);
    
    if (existing != null)
        return Result.Success(); // Already processed, return success
    
    // Proceed with ledger entry creation...
}
```

**Rationale**:
- **Exactly-once semantics**: Duplicate POST requests (retry, network issues) don't create duplicate charges
- **Database-enforced**: Unique constraint prevents race conditions
- **Natural keys**: Ride ID and Payment ID are already provided by upstream systems

**Alternatives Considered**:
- **Client-provided idempotency key**: Rejected - unnecessary complexity, upstream IDs are sufficient
- **No idempotency**: ❌ Rejected - FR-4 explicitly requires ride idempotency

---

## 6. Resilience Patterns

### 6.1 Polly Policy Configuration

**Decision**: 
- **Retry**: 3 attempts with exponential backoff (2^attempt seconds) for transient DB errors
- **Circuit Breaker**: Not applicable for database (same process)
- **Timeout**: 30 seconds for invoice generation queries, 5 seconds for write operations
- **Bulkhead**: Connection pool limit (max 100 connections per instance)

**Implementation**:
```csharp
// Startup
services.AddDbContext<AccountingDbContext>(options =>
{
    options.UseNpgsql(connString, npgsql =>
    {
        npgsql.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(8),
            errorCodesToAdd: null); // Default transient error codes
    });
});
```

**Rationale**:
- **Retry**: Handles transient connection failures (network blips, brief DB maintenance)
- **Timeout**: Prevents hung queries from exhausting connections
- **Connection pool**: Bulkhead isolation ensures one slow query doesn't block all requests

**Alternatives Considered**:
- **Manual retry logic**: ❌ Rejected - EF Core provider has built-in retry
- **Circuit breaker for DB**: Not applicable - DB is not a separate service boundary

---

## 7. API Design Patterns

### 7.1 REST Endpoint Design

**Decision**: **RESTful with POST for commands, GET for queries**

**Endpoint Structure**:
```
POST   /api/v1/accounts                          # Create account
GET    /api/v1/accounts/{accountId}              # Get account details
GET    /api/v1/accounts/{accountId}/balance      # Get current balance

POST   /api/v1/ledger/charges                    # Record ride charge
POST   /api/v1/ledger/payments                   # Record payment

GET    /api/v1/accounts/{accountId}/statement    # Get statement (date range)
POST   /api/v1/invoices/generate                 # Generate invoice
GET    /api/v1/invoices/{invoiceId}              # Get invoice
```

**Rationale**:
- **POST for commands**: Semantic correctness (non-idempotent from HTTP perspective, idempotent from business logic via idempotency keys)
- **GET for queries**: Cacheable, safe operations
- **Resource-oriented**: Aligns with REST principles

**Alternatives Considered**:
- **GraphQL**: Rejected - CRUD + reporting doesn't benefit from GraphQL complexity
- **gRPC**: Rejected - internal service may use gRPC later, but REST is required for external integrations

---

## 8. Testing Strategy

### 8.1 Test Pyramid

**Decision**:

| Test Type | Coverage | Purpose | Framework |
|-----------|----------|---------|-----------|
| Unit | 80%+ | Domain logic, validation | xUnit + NSubstitute |
| Integration | Critical paths | Database interactions, ledger consistency | xUnit + Testcontainers |
| Contract | All endpoints | API contract adherence | WireMock.Net |
| E2E | Happy path + critical failures | Full workflow (charge → payment → invoice) | xUnit + WebApplicationFactory |

**Rationale**:
- **Unit**: Fast feedback, tests domain rules (e.g., "Debit = Credit")
- **Integration**: Verifies EF Core mappings, transactions, query correctness with real PostgreSQL
- **Contract**: Ensures API stability for consumers
- **E2E**: Validates full user workflows

**Critical Integration Tests**:
1. **Ledger balance invariant**: After N charges and M payments, `Sum(Debits) - Sum(Credits) = 0`
2. **Tenant isolation**: Query for Account A with Tenant B context returns 404
3. **Idempotency**: POST same ride charge twice → 1 ledger entry
4. **Concurrency**: Parallel payment processing doesn't corrupt balance

---

## 9. Logging & Observability

### 9.1 Structured Logging

**Decision**: **Serilog with JSON output, correlation ID per request**

**Implementation**:
```csharp
// Middleware
app.Use(async (context, next) =>
{
    var correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault() 
                        ?? Guid.NewGuid().ToString();
    
    using (LogContext.PushProperty("CorrelationId", correlationId))
    using (LogContext.PushProperty("TenantId", currentTenant.Id))
    {
        await next();
    }
});

// Usage
_logger.LogInformation("RideChargeRecorded", new { RideId, AccountId, Amount });
```

**Rationale**:
- **Correlation ID**: Trace request across log entries
- **Tenant ID**: Filter logs per tenant for debugging
- **Structured fields**: Enables log querying (e.g., "all failed charges for tenant X")

---

### 9.2 Metrics

**Decision**: **OpenTelemetry metrics exported to Prometheus**

**Key Metrics**:
- `accounting_ledger_writes_total` (counter) - labeled by success/failure
- `accounting_ledger_write_duration_ms` (histogram)
- `accounting_invoice_generation_duration_ms` (histogram)
- `accounting_balance_query_duration_ms` (histogram)
- `accounting_tenant_count` (gauge)

**Rationale**:
- Monitors SLA compliance (< 100ms ledger write, < 2s invoice)
- Detects anomalies (spike in failed writes = DB issue)
- Capacity planning (tenant growth, query volume)

---

## 10. Clarifications Resolved

| Original Question | Resolution |
|-------------------|------------|
| Primary Dependencies? | ASP.NET Core, EF Core, MediatR, FluentValidation, Polly, Serilog, OpenTelemetry |
| Testing mocking framework? | NSubstitute, FluentAssertions, Testcontainers, Respawn |
| Concurrent request throughput? | 500 req/s per instance target |
| Expected tenant count? | 100-500 initially, plan for 5,000 |
| Transactions per tenant per day? | 1-10 (individual) to 500-2,000 (enterprise) rides/day |
| Multi-tenancy approach? | Row-level security with TenantId + global query filters |
| Decimal precision? | `decimal(19,4)` for all monetary amounts |
| Idempotency mechanism? | Unique index on (TenantId, IdempotencyKey) |
| Resilience patterns? | EF Core built-in retry, connection pooling, query timeouts |

---

## 11. Technology Decision Summary

### Selected Stack
```yaml
Language: C# 12 (.NET 8.0)
Framework: ASP.NET Core 8.0
ORM: Entity Framework Core 8.0
Database: PostgreSQL 16
Architecture: Clean Architecture + DDD
Patterns: CQRS (MediatR), Repository (via EF Core DbContext)
Resilience: Polly (retry, timeout)
Logging: Serilog (structured JSON)
Metrics: OpenTelemetry → Prometheus
Tracing: OpenTelemetry → Jaeger
Testing: xUnit, NSubstitute, Testcontainers, FluentAssertions
```

### Design Principles Applied
- ✅ Production-grade code from day 1 (no placeholders)
- ✅ Fixed-point decimal arithmetic
- ✅ Strong consistency via database transactions
- ✅ Idempotent operations
- ✅ Multi-tenant row-level security
- ✅ Parallel processing where applicable (`Task.WhenAll`)
- ✅ Comprehensive testing (unit + integration + contract)
- ✅ Structured logging with correlation IDs
- ✅ Resilience patterns (retry, timeout, bulkhead)

---

**Phase 0 Status**: ✅ COMPLETE - All clarifications resolved, technology stack finalized, ready for Phase 1 design.
