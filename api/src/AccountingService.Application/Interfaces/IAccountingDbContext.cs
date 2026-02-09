using Microsoft.EntityFrameworkCore;

namespace AccountingService.Application.Interfaces;

/// <summary>
/// Database context interface for dependency inversion.
/// Allows application layer to define database contracts without depending on infrastructure.
/// </summary>
public interface IAccountingDbContext
{
    /// <summary>
    /// Gets a DbSet for the specified entity type
    /// </summary>
    DbSet<TEntity> Set<TEntity>() where TEntity : class;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
