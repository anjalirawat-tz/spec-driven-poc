using AccountingService.Domain.Aggregates.LedgerAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountingService.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core entity configuration for LedgerEntry
/// </summary>
public class LedgerEntryConfiguration : IEntityTypeConfiguration<LedgerEntry>
{
    public void Configure(EntityTypeBuilder<LedgerEntry> builder)
    {
        builder.ToTable("LedgerEntries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .IsRequired();

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.Property(e => e.LedgerTransactionId)
            .IsRequired();

        builder.Property(e => e.AccountType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.DebitAmount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(e => e.CreditAmount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(e => e.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        // Index for account type aggregations
        builder.HasIndex(e => new { e.TenantId, e.AccountType });

        // Index for transaction lookups
        builder.HasIndex(e => e.LedgerTransactionId);

        // Global query filter for multi-tenant isolation
        builder.HasQueryFilter(e => EF.Property<Guid>(e, "TenantId") == Guid.Empty);
    }
}
