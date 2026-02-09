namespace AccountingService.Domain.Aggregates.LedgerAggregate;

/// <summary>
/// Transaction type for ledger entries
/// </summary>
public enum TransactionType
{
    /// <summary>
    /// Ride service charge transaction
    /// </summary>
    RideCharge = 1,

    /// <summary>
    /// Payment received transaction
    /// </summary>
    Payment = 2,

    /// <summary>
    /// Adjustment or correction (future use)
    /// </summary>
    Adjustment = 3
}
