namespace AccountingService.Domain.Aggregates.LedgerAggregate.Events;

/// <summary>
/// Domain event raised when a ride charge is recorded in the ledger
/// </summary>
public record RideChargeRecorded(
    Guid TransactionId,
    Guid TenantId,
    Guid AccountId,
    string RideId,
    decimal FareAmount,
    DateTime ServiceDate);
