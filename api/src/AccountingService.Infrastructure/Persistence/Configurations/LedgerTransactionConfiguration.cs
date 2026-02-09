using AccountingService.Domain.Aggregates.LedgerAggregate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountingService.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core entity configuration for LedgerTransaction aggregate
/// </summary>
public class LedgerTransactionConfiguration : IEntityTypeConfiguration<LedgerTransaction>
{
    public void Configure(EntityTypeBuilder<LedgerTransaction> builder)
    {
        builder.ToTable("LedgerTransactions");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .IsRequired();

        builder.Property(t => t.TenantId)
            .IsRequired();

        builder.Property(t => t.AccountId)
            .IsRequired();

        builder.Property(t => t.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(t => t.IdempotencyKey)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(t => t.ReferenceId)
            .HasMaxLength(100);

        builder.Property(t => t.ReferenceType)
            .HasMaxLength(50);

        builder.Property(t => t.TransactionDate)
            .IsRequired();

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        // Unique index for idempotency (tenant-scoped)
        builder.HasIndex(t => new { t.TenantId, t.IdempotencyKey })
            .IsUnique();

        // Index for account lookups
        builder.HasIndex(t => new { t.TenantId, t.AccountId });

        // Index for transaction date range queries
        builder.HasIndex(t => new { t.TenantId, t.TransactionDate });

        // Relationship with LedgerEntries
        builder.HasMany(t => t.Entries)
            .WithOne(e => e.LedgerTransaction)
            .HasForeignKey(e => e.LedgerTransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filter for multi-tenant isolation
        builder.HasQueryFilter(t => EF.Property<Guid>(t, "TenantId") == Guid.Empty);
    }
}
