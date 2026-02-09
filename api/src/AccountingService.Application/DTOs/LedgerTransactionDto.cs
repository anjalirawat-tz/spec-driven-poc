using AccountingService.Domain.Aggregates.LedgerAggregate;

namespace AccountingService.Application.DTOs;

/// <summary>
/// Data transfer object for LedgerTransaction
/// </summary>
public class LedgerTransactionDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid AccountId { get; set; }
    public TransactionType Type { get; set; }
    public string TypeName => Type.ToString();
    public string IdempotencyKey { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    public DateTime TransactionDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = "system";
    public List<LedgerEntryDto> Entries { get; set; } = new();

    public static LedgerTransactionDto FromDomain(LedgerTransaction transaction)
    {
        return new LedgerTransactionDto
        {
            Id = transaction.Id,
            TenantId = transaction.TenantId,
            AccountId = transaction.AccountId,
            Type = transaction.Type,
            IdempotencyKey = transaction.IdempotencyKey,
            Description = transaction.Description,
            ReferenceId = transaction.ReferenceId,
            ReferenceType = transaction.ReferenceType,
            TransactionDate = transaction.TransactionDate,
            CreatedAt = transaction.CreatedAt,
            CreatedBy = transaction.CreatedBy,
            Entries = transaction.Entries.Select(LedgerEntryDto.FromDomain).ToList()
        };
    }
}

/// <summary>
/// Data transfer object for LedgerEntry
/// </summary>
public class LedgerEntryDto
{
    public Guid Id { get; set; }
    public Guid LedgerTransactionId { get; set; }
    public LedgerAccountType AccountType { get; set; }
    public string AccountTypeName => AccountType.ToString();
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime CreatedAt { get; set; }

    public static LedgerEntryDto FromDomain(LedgerEntry entry)
    {
        return new LedgerEntryDto
        {
            Id = entry.Id,
            LedgerTransactionId = entry.LedgerTransactionId,
            AccountType = entry.AccountType,
            DebitAmount = entry.DebitAmount,
            CreditAmount = entry.CreditAmount,
            Currency = entry.Currency,
            CreatedAt = entry.CreatedAt
        };
    }
}
