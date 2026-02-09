namespace AccountingService.Domain.Aggregates.LedgerAggregate;

/// <summary>
/// Ledger account types per double-entry accounting
/// </summary>
public enum LedgerAccountType
{
    /// <summary>
    /// Accounts Receivable (Asset) - Debit increases, Credit decreases
    /// </summary>
    AccountsReceivable = 1,

    /// <summary>
    /// Service Revenue (Revenue) - Credit increases, Debit decreases
    /// </summary>
    ServiceRevenue = 2,

    /// <summary>
    /// Cash/Bank (Asset) - Debit increases, Credit decreases
    /// </summary>
    Cash = 3
}
