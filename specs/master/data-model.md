# Data Model: Dual-Entry Accounting & Invoicing Service

**Date**: 2026-02-09  
**Phase**: 1 - Data Model Design  
**Status**: Complete

---

## Overview

This document defines the domain model for the accounting service using Domain-Driven Design (DDD) principles. The model enforces double-entry accounting invariants, immutability for ledger entries, and multi-tenant isolation.

---

## Domain Model Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Tenant (Context)                         │
│  - TenantId (Guid)                                              │
│  - Currency = "USD"                                             │
└─────────────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Account    │  │ LedgerEntry  │  │   Invoice    │
│ (Aggregate)  │  │ (Aggregate)  │  │ (Aggregate)  │
└──────────────┘  └──────────────┘  └──────────────┘
        │               │               │
        └───────────────┴───────────────┘
                Relationships:
    - Account 1──* LedgerEntry
    - Account 1──* Invoice
    - Invoice *──* LedgerEntry (via InvoiceLineItem)
```

---

## 1. Aggregates

### 1.1 Account Aggregate

**Responsibility**: Represents the financially responsible entity (organization or individual) and maintains the current balance.

#### Entities

##### Account (Root)

| Property | Type | Constraints | Description |
|----------|------|-------------|-------------|
| `Id` | `Guid` | PK, Required | Account unique identifier |
| `TenantId` | `Guid` | Required, Indexed | Multi-tenant isolation |
| `AccountNumber` | `string` | Unique within tenant, max 50 chars | Human-readable account number |
| `Name` | `string` | Required, max 200 chars | Account holder name |
| `Type` | `AccountType` (enum) | Required | Organization or Individual |
| `Status` | `AccountStatus` (enum) | Required, default: Active | Active or Inactive |
| `CurrencyCode` | `string` | Fixed: "USD", length 3 | Currency (future-proofing) |
| `CurrentBalance` | `decimal(19,4)` | Calculated, not stored* | Computed from ledger |
| `CreatedAt` | `DateTime` | Required, UTC | Record creation timestamp |
| `CreatedBy` | `string` | Required, max 100 chars | User or system identifier |
| `UpdatedAt` | `DateTime?` | UTC | Last modification timestamp |

**Notes**:
- `*CurrentBalance` is computed via query, NOT stored to avoid sync issues with ledger
- Calculation: `SUM(Debit - Credit)` for all ledger entries for this account

**Domain Invariants**:
1. `AccountNumber` must be unique within tenant
2. `Name` cannot be empty or whitespace
3. Once created, `TenantId` cannot change
4. Inactive accounts cannot record new charges or payments

**Value Objects**:
- `AccountType`: `{ Organization = 1, Individual = 2 }`
- `AccountStatus`: `{ Active = 1, Inactive = 2 }`

#### Domain Events

```csharp
public record AccountCreated(Guid AccountId, Guid TenantId, string AccountNumber, AccountType Type);
public record AccountDeactivated(Guid AccountId, DateTime DeactivatedAt);
```

---

### 1.2 Ledger Aggregate

**Responsibility**: Records all financial transactions in double-entry format. Immutable after creation.

#### Entities

##### LedgerTransaction (Root)

| Property | Type | Constraints | Description |
|----------|------|-------------|-------------|
| `Id` | `Guid` | PK, Required | Transaction unique identifier |
| `TenantId` | `Guid` | Required, Indexed | Multi-tenant isolation |
| `TransactionDate` | `DateTime` | Required, UTC | When transaction occurred |
| `TransactionType` | `TransactionType` (enum) | Required | RideCharge or PaymentReceived |
| `IdempotencyKey` | `string` | Unique (TenantId, Key), max 100 chars | Prevents duplicates (RideId or PaymentRefId) |
| `Description` | `string` | Optional, max 500 chars | Human-readable description |
| `Metadata` | `JSON` | Optional | Additional context (e.g., FleetId, RideDetails) |
| `CreatedAt` | `DateTime` | Required, UTC | Record creation timestamp |
| `CreatedBy` | `string` | Required, max 100 chars | User or system identifier |

**Domain Invariants**:
1. Must have at least 2 ledger entries (debit and credit)
2. `SUM(Entries.Debit) - SUM(Entries.Credit) = 0` (enforced in transaction)
3. Cannot be modified or deleted after creation

**Value Objects**:
- `TransactionType`: `{ RideCharge = 1, PaymentReceived = 2 }`

##### LedgerEntry (Child Entity)

| Property | Type | Constraints | Description |
|----------|------|-------------|-------------|
| `Id` | `Guid` | PK, Required | Entry unique identifier |
| `TenantId` | `Guid` | Required, Indexed | Multi-tenant isolation |
| `TransactionId` | `Guid` | FK to LedgerTransaction, Required | Parent transaction |
| `AccountId` | `Guid` | FK to Account, Required | Which account this affects |
| `LedgerAccountType` | `LedgerAccountType` (enum) | Required | Chart of accounts entry type |
| `Debit` | `decimal(19,4)` | >= 0, Exclusive with Credit | Debit amount (0 if credit entry) |
| `Credit` | `decimal(19,4)` | >= 0, Exclusive with Credit | Credit amount (0 if debit entry) |
| `EntryDate` | `DateTime` | Required, UTC | Posting date (usually = TransactionDate) |
| `Description` | `string` | Optional, max 500 chars | Entry-specific notes |

**Domain Invariants**:
1. Exactly one of `Debit` or `Credit` must be > 0, the other must be 0
2. Cannot have both Debit and Credit > 0 simultaneously
3. `TenantId` must match parent transaction's `TenantId`
4. `AccountId` must belong to same `TenantId`

**Value Objects**:
- `LedgerAccountType`: 
  ```csharp
  {
      AccountsReceivable = 1,    // Asset
      ServiceRevenue = 2,        // Revenue
      Cash = 3,                  // Asset
      Bank = 4                   // Asset (future: differentiate from Cash)
  }
  ```

**Indexing Strategy**:
```sql
-- Fast balance queries
CREATE INDEX IX_LedgerEntry_AccountId_EntryDate 
    ON LedgerEntry (TenantId, AccountId, EntryDate);

-- Idempotency enforcement
CREATE UNIQUE INDEX IX_LedgerTransaction_IdempotencyKey 
    ON LedgerTransaction (TenantId, IdempotencyKey);

-- Ledger audit queries
CREATE INDEX IX_LedgerEntry_TransactionId 
    ON LedgerEntry (TransactionId);
```

#### Double-Entry Posting Templates

**Ride Charge**:
```
Transaction Type: RideCharge
Idempotency Key: {RideId}

Entry 1:
  LedgerAccountType: AccountsReceivable
  Debit: {FareAmount}
  Credit: 0
  
Entry 2:
  LedgerAccountType: ServiceRevenue
  Debit: 0
  Credit: {FareAmount}
```

**Payment Received**:
```
Transaction Type: PaymentReceived
Idempotency Key: {PaymentReferenceId}

Entry 1:
  LedgerAccountType: Cash (or Bank)
  Debit: {PaymentAmount}
  Credit: 0
  
Entry 2:
  LedgerAccountType: AccountsReceivable
  Debit: 0
  Credit: {PaymentAmount}
```

#### Domain Events

```csharp
public record RideChargeRecorded(Guid TransactionId, Guid AccountId, string RideId, decimal Amount, DateTime ServiceDate);
public record PaymentRecorded(Guid TransactionId, Guid AccountId, string PaymentRefId, decimal Amount, DateTime PaymentDate);
```

---

### 1.3 Invoice Aggregate

**Responsibility**: Generates read-only invoices from ledger data at specified frequencies.

#### Entities

##### Invoice (Root)

| Property | Type | Constraints | Description |
|----------|------|-------------|-------------|
| `Id` | `Guid` | PK, Required | Invoice unique identifier |
| `TenantId` | `Guid` | Required, Indexed | Multi-tenant isolation |
| `InvoiceNumber` | `string` | Unique within tenant, max 50 chars | Human-readable invoice number (e.g., INV-2026-0001) |
| `AccountId` | `Guid` | FK to Account, Required | Billed account |
| `BillingPeriodStart` | `DateTime` | Required, UTC | Start of billing period |
| `BillingPeriodEnd` | `DateTime` | Required, UTC | End of billing period |
| `Frequency` | `InvoiceFrequency` (enum) | Required | PerRide, Daily, Weekly, Monthly |
| `IssueDate` | `DateTime` | Required, UTC | When invoice was generated |
| `DueDate` | `DateTime?` | Optional, UTC | Payment due date (future enhancement) |
| `Subtotal` | `decimal(19,4)` | >= 0 | Sum of all line items |
| `PaymentsApplied` | `decimal(19,4)` | >= 0 | Total payments in period |
| `OutstandingBalance` | `decimal(19,4)` | Can be negative (overpayment) | Subtotal - PaymentsApplied |
| `Status` | `InvoiceStatus` (enum) | Required, default: Draft | Draft, Issued, Paid, Void |
| `GeneratedAt` | `DateTime` | Required, UTC | When invoice was created |
| `GeneratedBy` | `string` | Required, max 100 chars | User or system identifier |

**Domain Invariants**:
1. `BillingPeriodEnd` >= `BillingPeriodStart`
2. `InvoiceNumber` unique within tenant
3. Once `Status = Issued`, invoice is immutable
4. `Subtotal` must equal `SUM(LineItems.Amount)`

**Value Objects**:
- `InvoiceFrequency`: `{ PerRide = 1, Daily = 2, Weekly = 3, Monthly = 4 }`
- `InvoiceStatus`: `{ Draft = 1, Issued = 2, Paid = 3, Void = 4 }`

##### InvoiceLineItem (Child Entity)

| Property | Type | Constraints | Description |
|----------|------|-------------|-------------|
| `Id` | `Guid` | PK, Required | Line item unique identifier |
| `InvoiceId` | `Guid` | FK to Invoice, Required | Parent invoice |
| `LedgerEntryId` | `Guid` | FK to LedgerEntry, Required | Source ledger entry (traceability) |
| `ServiceDate` | `DateTime` | Required, UTC | When service was provided |
| `Description` | `string` | Required, max 500 chars | Line item description (e.g., "Ride {RideId}") |
| `RideId` | `string` | Optional, max 100 chars | Source ride identifier (for reference) |
| `Amount` | `decimal(19,4)` | Required | Charge amount |
| `Sequence` | `int` | Required | Display order within invoice |

**Domain Invariants**:
1. `LedgerEntryId` must reference a ledger entry for the same `AccountId` as the invoice
2. `ServiceDate` must fall within invoice's `BillingPeriodStart` and `BillingPeriodEnd`
3. Cannot modify after parent invoice is Issued

**Indexing Strategy**:
```sql
-- Fast invoice lookup by account
CREATE INDEX IX_Invoice_AccountId_IssueDate 
    ON Invoice (TenantId, AccountId, IssueDate DESC);

-- Invoice number uniqueness
CREATE UNIQUE INDEX IX_Invoice_InvoiceNumber 
    ON Invoice (TenantId, InvoiceNumber);

-- Line item queries
CREATE INDEX IX_InvoiceLineItem_InvoiceId 
    ON InvoiceLineItem (InvoiceId);
```

#### Domain Events

```csharp
public record InvoiceGenerated(Guid InvoiceId, Guid AccountId, string InvoiceNumber, decimal Subtotal, decimal OutstandingBalance);
public record InvoiceIssued(Guid InvoiceId, DateTime IssuedAt);
```

---

## 2. Value Objects

### 2.1 Money

```csharp
public record Money(decimal Amount, string Currency = "USD")
{
    public Money() : this(0m, "USD") { }
    
    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException("Cannot add different currencies");
        return new Money(a.Amount + b.Amount, a.Currency);
    }
    
    public static Money operator -(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException("Cannot subtract different currencies");
        return new Money(a.Amount - b.Amount, a.Currency);
    }
}
```

**Usage**: Encapsulates currency with amount, prevents accidental multi-currency operations.

---

### 2.2 DateRange

```csharp
public record DateRange(DateTime Start, DateTime End)
{
    public DateRange() : this(DateTime.UtcNow.Date, DateTime.UtcNow.Date) { }
    
    public void Validate()
    {
        if (End < Start)
            throw new ArgumentException("End date must be >= Start date");
    }
    
    public bool Contains(DateTime date) => date >= Start && date <= End;
    
    public int Days => (End - Start).Days + 1;
}
```

**Usage**: Billing periods, statement date ranges.

---

## 3. Domain Services

### 3.1 LedgerService

**Responsibility**: Enforces double-entry rules, creates balanced transactions.

```csharp
public interface ILedgerService
{
    Task<Result<LedgerTransaction>> RecordRideChargeAsync(
        Guid accountId, 
        string rideId, 
        decimal fareAmount, 
        DateTime serviceDate,
        string metadata,
        CancellationToken ct);
    
    Task<Result<LedgerTransaction>> RecordPaymentAsync(
        Guid accountId, 
        string paymentRefId, 
        decimal amount, 
        DateTime paymentDate,
        CancellationToken ct);
    
    Task<decimal> ComputeBalanceAsync(Guid accountId, CancellationToken ct);
}
```

**Invariant Enforcement**:
```csharp
private void ValidateDoubleEntry(LedgerTransaction txn)
{
    var totalDebit = txn.Entries.Sum(e => e.Debit);
    var totalCredit = txn.Entries.Sum(e => e.Credit);
    
    if (totalDebit != totalCredit)
        throw new LedgerImbalanceException($"Debit ({totalDebit}) != Credit ({totalCredit})");
}
```

---

### 3.2 InvoiceGeneratorService

**Responsibility**: Queries ledger, generates invoices per frequency.

```csharp
public interface IInvoiceGeneratorService
{
    Task<Result<Invoice>> GenerateInvoiceAsync(
        Guid accountId, 
        DateRange billingPeriod, 
        InvoiceFrequency frequency,
        CancellationToken ct);
    
    Task<Result<Invoice>> GeneratePerRideInvoiceAsync(
        Guid accountId, 
        string rideId,
        CancellationToken ct);
}
```

**Algorithm**:
1. Query all `LedgerEntry` for account within date range where `LedgerAccountType = ServiceRevenue` (charges)
2. Sum charges = `Subtotal`
3. Query all payments in same period
4. `OutstandingBalance = Subtotal - SUM(Payments)`
5. Create `Invoice` with `InvoiceLineItem[]` referencing `LedgerEntry.Id`

---

## 4. Validation Rules

### 4.1 Business Rule Validation

| Entity | Rule | Validation |
|--------|------|------------|
| `Account` | Name required | `!string.IsNullOrWhiteSpace(Name)` |
| `Account` | Account number unique per tenant | DB unique index check |
| `LedgerEntry` | Debit XOR Credit | `(Debit > 0 && Credit == 0) || (Credit > 0 && Debit == 0)` |
| `LedgerTransaction` | Balanced entries | `SUM(Debit) == SUM(Credit)` |
| `LedgerTransaction` | Idempotency enforced | Unique index on `(TenantId, IdempotencyKey)` |
| `Invoice` | Valid billing period | `BillingPeriodEnd >= BillingPeriodStart` |
| `Invoice` | Subtotal matches line items | `Subtotal == SUM(LineItems.Amount)` |
| `InvoiceLineItem` | Service date in period | `ServiceDate BETWEEN BillingPeriodStart AND BillingPeriodEnd` |

---

## 5. State Transitions

### 5.1 Account Status

```
[New] → Active (default) ⇄ Inactive
```

**Rules**:
- Active accounts can record charges/payments
- Inactive accounts: read-only, no new transactions

---

### 5.2 Invoice Status

```
[New] → Draft → Issued → Paid (or Void)
```

**Rules**:
- `Draft`: Can modify (future: support draft revisions)
- `Issued`: Immutable, sent to customer
- `Paid`: All outstanding balance settled (future enhancement)
- `Void`: Cancelled, no longer valid (future enhancement)

---

## 6. Queries (Read Models)

### 6.1 Account Balance Query

```csharp
public record AccountBalanceDto
{
    public Guid AccountId { get; init; }
    public string AccountNumber { get; init; }
    public string Name { get; init; }
    public decimal CurrentBalance { get; init; } // Computed
    public decimal TotalCharges { get; init; }
    public decimal TotalPayments { get; init; }
    public DateTime AsOfDate { get; init; }
}
```

**SQL**:
```sql
SELECT 
    a.Id AS AccountId,
    a.AccountNumber,
    a.Name,
    COALESCE(SUM(le.Debit - le.Credit), 0) AS CurrentBalance,
    COALESCE(SUM(CASE WHEN le.LedgerAccountType = 1 THEN le.Debit ELSE 0 END), 0) AS TotalCharges,
    COALESCE(SUM(CASE WHEN le.LedgerAccountType = 1 THEN le.Credit ELSE 0 END), 0) AS TotalPayments
FROM Account a
LEFT JOIN LedgerEntry le ON a.Id = le.AccountId AND a.TenantId = le.TenantId
WHERE a.TenantId = @tenantId AND a.Id = @accountId
GROUP BY a.Id, a.AccountNumber, a.Name;
```

---

### 6.2 Account Statement Query

```csharp
public record AccountStatementDto
{
    public Guid AccountId { get; init; }
    public DateRange Period { get; init; }
    public decimal OpeningBalance { get; init; }
    public List<StatementLineDto> Transactions { get; init; }
    public decimal ClosingBalance { get; init; }
}

public record StatementLineDto
{
    public DateTime Date { get; init; }
    public string Description { get; init; }
    public string TransactionType { get; init; } // Charge or Payment
    public decimal Debit { get; init; }
    public decimal Credit { get; init; }
    public decimal Balance { get; init; } // Running balance
}
```

---

## 7. Database Schema Summary

### Tables

1. `Account` - Account master
2. `LedgerTransaction` - Transaction header
3. `LedgerEntry` - Double-entry postings
4. `Invoice` - Invoice header
5. `InvoiceLineItem` - Invoice line items

### Relationships

```
Account 1──* LedgerEntry (AccountId FK)
LedgerTransaction 1──* LedgerEntry (TransactionId FK)
Account 1──* Invoice (AccountId FK)
Invoice 1──* InvoiceLineItem (InvoiceId FK)
InvoiceLineItem *──1 LedgerEntry (LedgerEntryId FK - traceability)
```

### Multi-Tenant Isolation

- Every table has `TenantId GUID NOT NULL`
- Composite indexes: `(TenantId, EntityId)` for FK lookups
- EF Core global query filter:
  ```csharp
  modelBuilder.Entity<TEntity>().HasQueryFilter(e => e.TenantId == _currentTenant.Id);
  ```

---

## 8. Migration Strategy

### Initial Schema

```sql
-- Phase 1: Core ledger
CREATE TABLE Account (...);
CREATE TABLE LedgerTransaction (...);
CREATE TABLE LedgerEntry (...);

-- Phase 2: Invoicing
CREATE TABLE Invoice (...);
CREATE TABLE InvoiceLineItem (...);

-- Indexes (see per-entity sections above)
```

### Seed Data (Dev/Test)

```csharp
// Chart of Accounts (LedgerAccountType enum values)
public enum LedgerAccountType
{
    AccountsReceivable = 1,
    ServiceRevenue = 2,
    Cash = 3,
    Bank = 4
}
```

---

## 9. Domain Model Completeness Checklist

- [x] **Entities identified**: Account, LedgerTransaction, LedgerEntry, Invoice, InvoiceLineItem
- [x] **Aggregates defined**: Account, Ledger, Invoice with clear boundaries
- [x] **Value objects**: Money, DateRange, enums for type safety
- [x] **Domain invariants**: Double-entry balance, idempotency, immutability documented
- [x] **State transitions**: Account status, Invoice status
- [x] **Validation rules**: Per entity, enforced at domain and DB level
- [x] **Relationships**: All FK relationships defined
- [x] **Indexing strategy**: Performance-critical indexes identified
- [x] **Multi-tenancy**: TenantId propagation and isolation enforced
- [x] **Queries**: Key read models for balance and statements defined

---

**Phase 1 Data Model Status**: ✅ COMPLETE - Ready for contract generation and implementation.
