namespace AccountingService.Domain.Aggregates.AccountAggregate;

/// <summary>
/// Account lifecycle status
/// </summary>
public enum AccountStatus
{
    /// <summary>
    /// Account is active and can be used in transactions
    /// </summary>
    Active = 1,

    /// <summary>
    /// Account is temporarily inactive but can be reactivated
    /// </summary>
    Inactive = 2,

    /// <summary>
    /// Account is permanently closed and cannot be used
    /// </summary>
    Closed = 3
}
