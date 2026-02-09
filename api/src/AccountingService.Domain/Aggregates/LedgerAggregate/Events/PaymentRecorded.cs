namespace AccountingService.Domain.Aggregates.LedgerAggregate.Events;

/// <summary>
/// Domain event raised when a payment is recorded
/// </summary>
public record PaymentRecorded(
    Guid TransactionId,
    Guid TenantId,
    Guid AccountId,
    string PaymentReferenceId,
    decimal Amount,
    DateTime PaymentDate,
    string? PaymentMode);
