using AccountingService.Domain.Aggregates.LedgerAggregate;

namespace AccountingService.Domain.Services;

/// <summary>
/// Domain service for ledger operations
/// </summary>
public interface ILedgerService
{
    /// <summary>
    /// Records a ride charge with double-entry bookkeeping
    /// </summary>
    Task<LedgerTransaction> RecordRideChargeAsync(
        Guid accountId,
        string rideId,
        decimal fareAmount,
        DateTime serviceDate,
        string? fleetId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Records a payment with double-entry bookkeeping
    /// </summary>
    Task<LedgerTransaction> RecordPaymentAsync(
        Guid accountId,
        string paymentReferenceId,
        decimal amount,
        DateTime paymentDate,
        string? paymentMode = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates account balance (Total Debits - Total Credits for AR account)
    /// </summary>
    Task<decimal> GetAccountBalanceAsync(
        Guid accountId,
        CancellationToken cancellationToken = default);
}
