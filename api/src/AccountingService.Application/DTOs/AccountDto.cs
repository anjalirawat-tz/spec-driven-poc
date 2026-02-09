using AccountingService.Domain.Aggregates.AccountAggregate;

namespace AccountingService.Application.DTOs;

/// <summary>
/// Data transfer object for Account entity
/// </summary>
public class AccountDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AccountType Type { get; set; }
    public string TypeName => Type.ToString();
    public AccountStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public Guid? ParentAccountId { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static AccountDto FromDomain(Account account)
    {
        return new AccountDto
        {
            Id = account.Id,
            TenantId = account.TenantId,
            Code = account.Code,
            Name = account.Name,
            Description = account.Description,
            Type = account.Type,
            Status = account.Status,
            ParentAccountId = account.ParentAccountId,
            Currency = account.Currency,
            CreatedAt = account.CreatedAt,
            UpdatedAt = account.UpdatedAt
        };
    }
}
