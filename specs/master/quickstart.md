# Quickstart Guide: Dual-Entry Accounting & Invoicing Service

**Version**: 1.0.0  
**Last Updated**: 2026-02-09  
**Prerequisites**: .NET 8.0 SDK, Docker, PostgreSQL (or Docker Compose)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Local Development Setup](#local-development-setup)
4. [API Usage Examples](#api-usage-examples)
5. [Testing](#testing)
6. [Common Workflows](#common-workflows)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **.NET 8.0 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/8.0))
- **Docker Desktop** (for PostgreSQL and integration tests)
- **Git**
- **Your preferred IDE**: Visual Studio 2022, VS Code, or Rider

### Quick Start (5 minutes)

```powershell
# 1. Clone the repository
git clone <repository-url>
cd spec-driven-poc/api

# 2. Start PostgreSQL via Docker Compose
docker-compose up -d

# 3. Apply database migrations
cd src/AccountingService.API
dotnet ef database update

# 4. Run the API
dotnet run

# 5. Open API documentation
start https://localhost:5001/swagger
```

---

## Project Structure

```
api/
├── src/
│   ├── AccountingService.Domain/          # Domain models, aggregates, value objects
│   │   ├── Aggregates/
│   │   │   ├── AccountAggregate/
│   │   │   │   ├── Account.cs           # Aggregate root
│   │   │   │   ├── AccountType.cs       # Enum
│   │   │   │   └── AccountStatus.cs
│   │   │   ├── LedgerAggregate/
│   │   │   │   ├── LedgerTransaction.cs
│   │   │   │   ├── LedgerEntry.cs
│   │   │   │   └── LedgerAccountType.cs
│   │   │   └── InvoiceAggregate/
│   │   │       ├── Invoice.cs
│   │   │       └── InvoiceLineItem.cs
│   │   ├── ValueObjects/
│   │   │   ├── Money.cs
│   │   │   └── DateRange.cs
│   │   └── Services/
│   │       ├── ILedgerService.cs
│   │       └── IInvoiceGeneratorService.cs
│   │
│   ├── AccountingService.Application/     # Use cases (CQRS)
│   │   ├── Commands/
│   │   │   ├── CreateAccount/
│   │   │   │   ├── CreateAccountCommand.cs
│   │   │   │   ├── CreateAccountCommandHandler.cs
│   │   │   │   └── CreateAccountValidator.cs
│   │   │   ├── RecordRideCharge/
│   │   │   └── RecordPayment/
│   │   ├── Queries/
│   │   │   ├── GetAccountBalance/
│   │   │   ├── GetAccountStatement/
│   │   │   └── GetInvoice/
│   │   ├── DTOs/
│   │   ├── Behaviors/                    # MediatR pipeline behaviors
│   │   │   ├── ValidationBehavior.cs
│   │   │   ├── TransactionBehavior.cs
│   │   │   └── LoggingBehavior.cs
│   │   └── Interfaces/
│   │       └── IAccountingDbContext.cs
│   │
│   ├── AccountingService.Infrastructure/  # EF Core, PostgreSQL, external services
│   │   ├── Persistence/
│   │   │   ├── AccountingDbContext.cs
│   │   │   ├── Configurations/          # EF entity configurations
│   │   │   └── Migrations/
│   │   ├── Services/
│   │   │   ├── LedgerService.cs
│   │   │   └── InvoiceGeneratorService.cs
│   │   └── Extensions/
│   │       └── ServiceCollectionExtensions.cs
│   │
│   └── AccountingService.API/             # REST API, controllers, startup
│       ├── Controllers/
│       │   ├── AccountsController.cs
│       │   ├── LedgerController.cs
│       │   └── InvoicesController.cs
│       ├── Middleware/
│       │   ├── TenantMiddleware.cs
│       │   ├── ErrorHandlingMiddleware.cs
│       │   └── CorrelationIdMiddleware.cs
│       ├── Program.cs
│       ├── appsettings.json
│       └── appsettings.Development.json
│
└── tests/
    ├── AccountingService.Domain.Tests/
    ├── AccountingService.Application.Tests/
    ├── AccountingService.IntegrationTests/
    │   ├── Fixtures/
    │   │   └── DatabaseFixture.cs       # Testcontainers setup
    │   └── Tests/
    │       ├── LedgerTests.cs
    │       └── InvoiceGenerationTests.cs
    └── AccountingService.ContractTests/
```

---

## Local Development Setup

### 1. Database Setup

#### Option A: Docker Compose (Recommended)

```yaml
# docker-compose.yml (create in api/ directory)
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: accounting_dev
      POSTGRES_USER: accounting_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```powershell
# Start database
docker-compose up -d

# Stop database
docker-compose down
```

#### Option B: Local PostgreSQL Installation

Download and install PostgreSQL 16 from [postgresql.org](https://www.postgresql.org/download/).

Create database:
```sql
CREATE DATABASE accounting_dev;
CREATE USER accounting_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE accounting_dev TO accounting_user;
```

### 2. Connection String Configuration

Update `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "AccountingDb": "Host=localhost;Port=5432;Database=accounting_dev;Username=accounting_user;Password=dev_password"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

### 3. Apply Migrations

```powershell
cd src/AccountingService.API
dotnet ef database update
```

**Common EF Core Commands**:
```powershell
# Create new migration
dotnet ef migrations add <MigrationName> --project ../AccountingService.Infrastructure

# Revert migration
dotnet ef database update <PreviousMigrationName>

# Generate SQL script
dotnet ef migrations script --output migration.sql
```

### 4. Run the API

```powershell
cd src/AccountingService.API
dotnet run
```

API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

---

## API Usage Examples

### Headers Required for All Requests

```http
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: <TENANT_GUID>
Content-Type: application/json
```

### Create Account

```powershell
curl -X POST https://localhost:5001/v1/accounts `
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000001" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{
    "accountNumber": "ACC-ORG-001",
    "name": "St. Mary'\''s Rehabilitation Center",
    "type": "Organization"
  }'
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "accountNumber": "ACC-ORG-001",
  "name": "St. Mary's Rehabilitation Center",
  "type": "Organization",
  "status": "Active",
  "currencyCode": "USD",
  "createdAt": "2026-02-09T10:30:00Z"
}
```

### Record Ride Charge

```powershell
curl -X POST https://localhost:5001/v1/ledger/charges `
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000001" `
  -H "Content-Type: application/json" `
  -d '{
    "rideId": "RIDE-20260209-001",
    "accountId": "550e8400-e29b-41d4-a716-446655440000",
    "fareAmount": 45.50,
    "serviceDate": "2026-02-09T08:00:00Z",
    "metadata": {
      "fleetId": "FLEET-001",
      "route": "123 Main St to 456 Oak Ave"
    }
  }'
```

**Response (201 Created)**:
```json
{
  "transactionId": "660e8400-e29b-41d4-a716-446655440000",
  "transactionType": "RideCharge",
  "idempotencyKey": "RIDE-20260209-001",
  "transactionDate": "2026-02-09T08:00:00Z",
  "createdAt": "2026-02-09T10:35:00Z"
}
```

**Idempotent Retry** (same request again):
```http
HTTP/1.1 200 OK
{
  "transactionId": "660e8400-e29b-41d4-a716-446655440000",
  ...
}
```

### Record Payment

```powershell
curl -X POST https://localhost:5001/v1/ledger/payments `
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000001" `
  -H "Content-Type: application/json" `
  -d '{
    "paymentReferenceId": "PAY-STRIPE-ch_abc123",
    "accountId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 100.00,
    "paymentDate": "2026-02-09T14:00:00Z",
    "paymentMode": "CreditCard"
  }'
```

### Get Account Balance

```powershell
curl -X GET "https://localhost:5001/v1/accounts/550e8400-e29b-41d4-a716-446655440000/balance" `
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000001"
```

**Response**:
```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "accountNumber": "ACC-ORG-001",
  "currentBalance": 145.50,
  "asOfDate": "2026-02-09T15:00:00Z"
}
```

### Generate Monthly Invoice

```powershell
curl -X POST https://localhost:5001/v1/invoices `
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000001" `
  -H "Content-Type: application/json" `
  -d '{
    "accountId": "550e8400-e29b-41d4-a716-446655440000",
    "frequency": "Monthly",
    "billingPeriodStart": "2026-02-01",
    "billingPeriodEnd": "2026-02-28"
  }'
```

**Response (201 Created)**:
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "invoiceNumber": "INV-2026-02-001",
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "frequency": "Monthly",
  "billingPeriodStart": "2026-02-01",
  "billingPeriodEnd": "2026-02-28",
  "issueDate": "2026-02-09T15:30:00Z",
  "subtotal": 456.00,
  "paymentsApplied": 300.00,
  "outstandingBalance": 156.00,
  "status": "Issued"
}
```

### Get Invoice with Line Items

```powershell
curl -X GET "https://localhost:5001/v1/invoices/770e8400-e29b-41d4-a716-446655440000" `
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000001"
```

**Response**:
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "invoiceNumber": "INV-2026-02-001",
  "account": {
    "accountNumber": "ACC-ORG-001",
    "name": "St. Mary's Rehabilitation Center"
  },
  "billingPeriodStart": "2026-02-01",
  "billingPeriodEnd": "2026-02-28",
  "lineItems": [
    {
      "serviceDate": "2026-02-09T08:00:00Z",
      "description": "Ride RIDE-20260209-001: 123 Main St to 456 Oak Ave",
      "rideId": "RIDE-20260209-001",
      "amount": 45.50,
      "ledgerEntryId": "880e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "subtotal": 456.00,
  "paymentsApplied": 300.00,
  "outstandingBalance": 156.00
}
```

---

## Testing

### Unit Tests

```powershell
# Run all unit tests
dotnet test tests/AccountingService.Domain.Tests
dotnet test tests/AccountingService.Application.Tests

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Integration Tests

Integration tests use **Testcontainers** to spin up a real PostgreSQL instance.

```powershell
# Ensure Docker is running first
docker ps

# Run integration tests
dotnet test tests/AccountingService.IntegrationTests
```

**Example Integration Test**:
```csharp
public class LedgerTests : IClassFixture<DatabaseFixture>
{
    [Fact]
    public async Task RecordRideCharge_CreatesBalancedLedgerEntries()
    {
        // Arrange
        var accountId = await CreateTestAccount();
        var command = new RecordRideChargeCommand
        {
            RideId = "RIDE-TEST-001",
            AccountId = accountId,
            FareAmount = 50.00m,
            ServiceDate = DateTime.UtcNow
        };
        
        // Act
        var result = await _mediator.Send(command);
        
        // Assert
        result.IsSuccess.Should().BeTrue();
        
        var entries = await _dbContext.LedgerEntries
            .Where(e => e.TransactionId == result.Value.TransactionId)
            .ToListAsync();
        
        entries.Should().HaveCount(2);
        entries.Sum(e => e.Debit - e.Credit).Should().Be(0); // Balanced
    }
}
```

### Contract Tests

```powershell
dotnet test tests/AccountingService.ContractTests
```

Tests verify API responses match OpenAPI specification.

---

## Common Workflows

### Workflow 1: Onboard New Organization

```powershell
# 1. Create account
POST /v1/accounts
{
  "accountNumber": "ACC-ORG-002",
  "name": "Green Valley Hospital",
  "type": "Organization"
}
# → Returns accountId

# 2. Record initial rides
POST /v1/ledger/charges (repeat for each ride)

# 3. Check balance
GET /v1/accounts/{accountId}/balance

# 4. Generate first invoice
POST /v1/invoices
{
  "accountId": "{accountId}",
  "frequency": "Monthly",
  "billingPeriodStart": "2026-02-01",
  "billingPeriodEnd": "2026-02-28"
}
```

### Workflow 2: Handle Payment

```powershell
# 1. Payment received from external processor
POST /v1/ledger/payments
{
  "paymentReferenceId": "PAY-STRIPE-ch_xyz789",
  "accountId": "{accountId}",
  "amount": 500.00,
  "paymentDate": "2026-02-10T10:00:00Z"
}

# 2. Verify updated balance
GET /v1/accounts/{accountId}/balance
# Balance should decrease by 500.00
```

### Workflow 3: Generate Statement

```powershell
# Get all transactions for a date range
GET /v1/accounts/{accountId}/statement?startDate=2026-02-01&endDate=2026-02-28

# Response includes:
# - Opening balance
# - All charges and payments
# - Running balance after each transaction
# - Closing balance
```

---

## Troubleshooting

### Database Connection Issues

**Problem**: `Npgsql.NpgsqlException: Connection refused`

**Solutions**:
```powershell
# Check if PostgreSQL is running
docker ps | Select-String postgres

# Restart database
docker-compose restart

# Check connection string in appsettings.Development.json
```

### Migration Errors

**Problem**: `The migration '...' has already been applied`

**Solution**:
```powershell
# Check migration history
dotnet ef migrations list

# Revert and re-apply
dotnet ef database update <PreviousMigration>
dotnet ef database update
```

### Ledger Imbalance Exception

**Problem**: `LedgerImbalanceException: Debit (100) != Credit (0)`

**Cause**: Bug in ledger entry creation logic.

**Debugging**:
```csharp
// Add breakpoint in TransactionBehavior.cs
// Inspect LedgerEntry objects before validation
```

### Tenant Isolation Issue

**Problem**: Seeing data from other tenants

**Solution**:
```csharp
// Verify global query filter in AccountingDbContext.cs
modelBuilder.Entity<Account>().HasQueryFilter(a => a.TenantId == _currentTenant.Id);

// Check TenantMiddleware is registered in Program.cs
app.UseMiddleware<TenantMiddleware>();
```

### Performance Issues

**Problem**: Slow balance queries

**Solutions**:
```sql
-- Check if indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'ledgerentry';

-- Add missing index
CREATE INDEX IX_LedgerEntry_AccountId_EntryDate 
ON "LedgerEntry" ("TenantId", "AccountId", "EntryDate");

-- Use AsNoTracking for read queries
var balance = await _dbContext.LedgerEntries
    .AsNoTracking()  // ← Important for performance
    .Where(...)
    .SumAsync(...);
```

---

## Additional Resources

- **OpenAPI Spec**: [contracts/accounting-api.yaml](contracts/accounting-api.yaml)
- **Data Model**: [data-model.md](data-model.md)
- **Research & Tech Decisions**: [research.md](research.md)
- **EF Core Docs**: https://learn.microsoft.com/en-us/ef/core/
- **MediatR Docs**: https://github.com/jbogard/MediatR
- **FluentValidation Docs**: https://docs.fluentvalidation.net/

---

## Next Steps

1. **Implement Domain Models**: Start with `Account`, `LedgerTransaction`, `LedgerEntry` in `AccountingService.Domain`
2. **Setup EF Core**: Create `AccountingDbContext` and entity configurations
3. **Create First Migration**: `dotnet ef migrations add InitialCreate`
4. **Implement Commands**: Begin with `CreateAccountCommand` and handler
5. **Add Validation**: FluentValidation rules for each command
6. **Write Tests**: TDD approach - write tests first, then implement

---

**Happy Coding! 🚀**
