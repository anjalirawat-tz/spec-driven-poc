using AccountingService.Domain.Common;

namespace AccountingService.Domain.Aggregates.LedgerAggregate;

/// <summary>
/// Ledger entry - one side of a double-entry transaction
/// Represents a single debit or credit to a ledger account
/// </summary>
public class LedgerEntry : TenantEntity
{
    public Guid LedgerTransactionId { get; private set; }
    public LedgerAccountType AccountType { get; private set; }
    public decimal DebitAmount { get; private set; }
    public decimal CreditAmount { get; private set; }
    public string Currency { get; private set; } = "USD";
    public DateTime CreatedAt { get; private set; }

    // Navigation property
    public LedgerTransaction? LedgerTransaction { get; private set; }

    // EF Core constructor
    private LedgerEntry() : base() { }

    // Domain constructor
    private LedgerEntry(
        Guid tenantId,
        Guid ledgerTransactionId,
        LedgerAccountType accountType,
        decimal debitAmount,
        decimal creditAmount,
        string currency) : base()
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        LedgerTransactionId = ledgerTransactionId;
        AccountType = accountType;
        DebitAmount = debitAmount;
        CreditAmount = creditAmount;
        Currency = currency;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Creates a debit entry
    /// </summary>
    public static LedgerEntry CreateDebit(
        Guid tenantId,
        Guid ledgerTransactionId,
        LedgerAccountType accountType,
        decimal amount,
        string currency = "USD")
    {
        if (amount <= 0)
            throw new ArgumentException("Debit amount must be positive", nameof(amount));

        return new LedgerEntry(tenantId, ledgerTransactionId, accountType, amount, 0, currency);
    }

    /// <summary>
    /// Creates a credit entry
    /// </summary>
    public static LedgerEntry CreateCredit(
        Guid tenantId,
        Guid ledgerTransactionId,
        LedgerAccountType accountType,
        decimal amount,
        string currency = "USD")
    {
        if (amount <= 0)
            throw new ArgumentException("Credit amount must be positive", nameof(amount));

        return new LedgerEntry(tenantId, ledgerTransactionId, accountType, 0, amount, currency);
    }
}
