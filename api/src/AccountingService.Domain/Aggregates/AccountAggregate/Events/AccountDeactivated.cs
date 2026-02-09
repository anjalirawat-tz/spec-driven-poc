namespace AccountingService.Domain.Aggregates.AccountAggregate.Events;

/// <summary>
/// Domain event raised when an account is deactivated
/// </summary>
public record AccountDeactivated(
    Guid AccountId,
    Guid TenantId);
