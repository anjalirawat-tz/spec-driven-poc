namespace AccountingService.Domain.Aggregates.AccountAggregate.Events;

/// <summary>
/// Domain event raised when a new account is created
/// </summary>
public record AccountCreated(
    Guid AccountId,
    Guid TenantId,
    string Code,
    string Name,
    AccountType Type);
