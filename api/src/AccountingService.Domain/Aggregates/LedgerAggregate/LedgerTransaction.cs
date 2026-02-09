using AccountingService.Domain.Aggregates.LedgerAggregate.Events;
using AccountingService.Domain.Common;

namespace AccountingService.Domain.Aggregates.LedgerAggregate;

/// <summary>
/// LedgerTransaction aggregate root - represents a complete double-entry transaction
/// Ensures debits always equal credits (fundamental accounting equation)
/// </summary>
public class LedgerTransaction : TenantEntity
{
    private readonly List<LedgerEntry> _entries = new();
    private readonly List<object> _domainEvents = new();

    public Guid AccountId { get; private set; }
    public TransactionType Type { get; private set; }
    public string IdempotencyKey { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? ReferenceId { get; private set; }
    public string? ReferenceType { get; private set; }
    public DateTime TransactionDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; } = "system";

    // Navigation properties
    public IReadOnlyList<LedgerEntry> Entries => _entries.AsReadOnly();

    // EF Core constructor
    private LedgerTransaction() : base() { }

    // Domain constructor
    private LedgerTransaction(
        Guid tenantId,
        Guid accountId,
        TransactionType type,
        string idempotencyKey,
        string description,
        string? referenceId,
        string? referenceType,
        DateTime transactionDate,
        string createdBy) : base()
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        AccountId = accountId;
        Type = type;
        IdempotencyKey = idempotencyKey;
        Description = description;
        ReferenceId = referenceId;
        ReferenceType = referenceType;
        TransactionDate = transactionDate;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
    }

    /// <summary>
    /// Creates a ride charge transaction with double-entry bookkeeping
    /// DR Accounts Receivable, CR Service Revenue
    /// </summary>
    public static LedgerTransaction CreateRideCharge(
        Guid tenantId,
        Guid accountId,
        string rideId,
        decimal fareAmount,
        DateTime serviceDate,
        string? fleetId = null,
        string createdBy = "system")
    {
        if (fareAmount <= 0)
            throw new ArgumentException("Fare amount must be positive", nameof(fareAmount));

        var idempotencyKey = $"ride:{rideId}";
        var description = $"Ride service charge - {rideId}";

        var transaction = new LedgerTransaction(
            tenantId,
            accountId,
            TransactionType.RideCharge,
            idempotencyKey,
            description,
            rideId,
            "Ride",
            serviceDate,
            createdBy);

        // Double-entry: DR Accounts Receivable, CR Service Revenue
        var debitEntry = LedgerEntry.CreateDebit(
            tenantId,
            transaction.Id,
            LedgerAccountType.AccountsReceivable,
            fareAmount);

        var creditEntry = LedgerEntry.CreateCredit(
            tenantId,
            transaction.Id,
            LedgerAccountType.ServiceRevenue,
            fareAmount);

        transaction._entries.Add(debitEntry);
        transaction._entries.Add(creditEntry);

        // Validate double-entry balance
        transaction.ValidateBalance();

        // Raise domain event
        transaction.AddDomainEvent(new RideChargeRecorded(
            transaction.Id,
            tenantId,
            accountId,
            rideId,
            fareAmount,
            serviceDate));

        return transaction;
    }

    /// <summary>
    /// Creates a payment transaction with double-entry bookkeeping
    /// DR Cash, CR Accounts Receivable
    /// </summary>
    public static LedgerTransaction CreatePayment(
        Guid tenantId,
        Guid accountId,
        string paymentReferenceId,
        decimal amount,
        DateTime paymentDate,
        string? paymentMode = null,
        string createdBy = "system")
    {
        if (amount <= 0)
            throw new ArgumentException("Payment amount must be positive", nameof(amount));

        var idempotencyKey = $"payment:{paymentReferenceId}";
        var description = $"Payment received - {paymentReferenceId}";
        if (!string.IsNullOrEmpty(paymentMode))
            description += $" ({paymentMode})";

        var transaction = new LedgerTransaction(
            tenantId,
            accountId,
            TransactionType.Payment,
            idempotencyKey,
            description,
            paymentReferenceId,
            "Payment",
            paymentDate,
            createdBy);

        // Double-entry: DR Cash, CR Accounts Receivable
        var debitEntry = LedgerEntry.CreateDebit(
            tenantId,
            transaction.Id,
            LedgerAccountType.Cash,
            amount);

        var creditEntry = LedgerEntry.CreateCredit(
            tenantId,
            transaction.Id,
            LedgerAccountType.AccountsReceivable,
            amount);

        transaction._entries.Add(debitEntry);
        transaction._entries.Add(creditEntry);

        // Validate double-entry balance
        transaction.ValidateBalance();

        // Raise domain event
        transaction.AddDomainEvent(new PaymentRecorded(
            transaction.Id,
            tenantId,
            accountId,
            paymentReferenceId,
            amount,
            paymentDate,
            paymentMode));

        return transaction;
    }

    /// <summary>
    /// Validates that debits equal credits (fundamental accounting equation)
    /// </summary>
    private void ValidateBalance()
    {
        var totalDebits = _entries.Sum(e => e.DebitAmount);
        var totalCredits = _entries.Sum(e => e.CreditAmount);

        if (totalDebits != totalCredits)
        {
            throw new InvalidOperationException(
                $"Transaction is unbalanced: Debits={totalDebits}, Credits={totalCredits}. " +
                "Double-entry bookkeeping requires debits to equal credits.");
        }
    }

    public IReadOnlyCollection<object> GetDomainEvents() => _domainEvents.AsReadOnly();

    public void ClearDomainEvents() => _domainEvents.Clear();

    private void AddDomainEvent(object domainEvent) => _domainEvents.Add(domainEvent);
}
