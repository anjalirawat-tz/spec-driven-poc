namespace AccountingService.Domain.Aggregates.AccountAggregate;

/// <summary>
/// Account classification types per data-model.md
/// </summary>
public enum AccountType
{
    /// <summary>
    /// Assets - Economic resources with future benefit
    /// </summary>
    Asset = 1,

    /// <summary>
    /// Liabilities - Obligations and debts
    /// </summary>
    Liability = 2,

    /// <summary>
    /// Equity - Owner's residual interest
    /// </summary>
    Equity = 3,

    /// <summary>
    /// Revenue - Income from operations
    /// </summary>
    Revenue = 4,

    /// <summary>
    /// Expenses - Costs of operations
    /// </summary>
    Expense = 5
}
