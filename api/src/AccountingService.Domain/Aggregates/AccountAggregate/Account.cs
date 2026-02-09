using AccountingService.Domain.Aggregates.AccountAggregate.Events;
using AccountingService.Domain.Common;

namespace AccountingService.Domain.Aggregates.AccountAggregate;

/// <summary>
/// Account aggregate root - represents a chart of accounts entry
/// </summary>
public class Account : TenantEntity
{
    private readonly List<object> _domainEvents = new();

    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public AccountType Type { get; private set; }
    public AccountStatus Status { get; private set; }
    public Guid? ParentAccountId { get; private set; }
    public string Currency { get; private set; } = "USD";
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation property
    public Account? ParentAccount { get; private set; }

    // EF Core constructor
    private Account() : base() { }

    // Domain constructor
    private Account(
        Guid tenantId,
        string code,
        string name,
        AccountType type,
        string currency,
        string? description,
        Guid? parentAccountId) : base()
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        Code = code;
        Name = name;
        Description = description;
        Type = type;
        Status = AccountStatus.Active;
        ParentAccountId = parentAccountId;
        Currency = currency;
        CreatedAt = DateTime.UtcNow;
    }

    // Factory method
    public static Account Create(
        Guid tenantId,
        string code,
        string name,
        AccountType type,
        string currency = "USD",
        string? description = null,
        Guid? parentAccountId = null)
    {
        var account = new Account(tenantId, code, name, type, currency, description, parentAccountId);

        account.AddDomainEvent(new AccountCreated(account.Id, account.TenantId, account.Code, account.Name, account.Type));

        return account;
    }

    public void Update(string? name = null, string? description = null, AccountStatus? status = null)
    {
        if (name != null) Name = name;
        if (description != null) Description = description;
        if (status.HasValue) Status = status.Value;
        
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        if (Status == AccountStatus.Closed)
            throw new InvalidOperationException("Cannot deactivate a closed account");

        Status = AccountStatus.Inactive;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new AccountDeactivated(Id, TenantId));
    }

    public void Activate()
    {
        if (Status == AccountStatus.Closed)
            throw new InvalidOperationException("Cannot activate a closed account");

        Status = AccountStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Close()
    {
        Status = AccountStatus.Closed;
        UpdatedAt = DateTime.UtcNow;
    }

    public IReadOnlyCollection<object> GetDomainEvents() => _domainEvents.AsReadOnly();

    public void ClearDomainEvents() => _domainEvents.Clear();

    private void AddDomainEvent(object domainEvent) => _domainEvents.Add(domainEvent);
}
