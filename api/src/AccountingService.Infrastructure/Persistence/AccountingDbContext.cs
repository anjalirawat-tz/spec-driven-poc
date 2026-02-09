using AccountingService.Application.Interfaces;
using AccountingService.Domain.Aggregates.AccountAggregate;
using AccountingService.Domain.Aggregates.LedgerAggregate;
using Microsoft.EntityFrameworkCore;

namespace AccountingService.Infrastructure.Persistence;

/// <summary>
/// EF Core database context for the Accounting Service.
/// Implements multi-tenant isolation via global query filters.
/// </summary>
public class AccountingDbContext : DbContext, IAccountingDbContext
{
    private readonly ICurrentTenant _tenantService;

    public AccountingDbContext(
        DbContextOptions<AccountingDbContext> options,
        ICurrentTenant tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    // DbSets for aggregates
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<LedgerTransaction> LedgerTransactions => Set<LedgerTransaction>();
    public DbSet<LedgerEntry> LedgerEntries => Set<LedgerEntry>();
    // public DbSet<Invoice> Invoices => Set<Invoice>();
    // public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply entity configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AccountingDbContext).Assembly);

        // Apply global query filters for multi-tenant isolation
        ApplyTenantQueryFilters(modelBuilder);
    }

    private void ApplyTenantQueryFilters(ModelBuilder modelBuilder)
    {
        // Apply tenant filter to Account
        modelBuilder.Entity<Account>()
            .HasQueryFilter(e => e.TenantId == _tenantService.Id);

        // Apply tenant filter to LedgerTransaction
        modelBuilder.Entity<LedgerTransaction>()
            .HasQueryFilter(e => e.TenantId == _tenantService.Id);

        // Apply tenant filter to LedgerEntry
        modelBuilder.Entity<LedgerEntry>()
            .HasQueryFilter(e => e.TenantId == _tenantService.Id);

        // Future: Add query filters for other tenant entities (Invoice, etc.)
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Future: Add domain events dispatch here if needed
        return await base.SaveChangesAsync(cancellationToken);
    }
}

