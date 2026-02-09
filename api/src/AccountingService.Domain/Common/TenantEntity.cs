namespace AccountingService.Domain.Common;

/// <summary>
/// Base entity for all tenant-scoped entities.
/// Ensures multi-tenant isolation at the domain level.
/// </summary>
public abstract class TenantEntity
{
    /// <summary>
    /// Entity unique identifier
    /// </summary>
    public Guid Id { get; protected set; }

    /// <summary>
    /// Tenant identifier for multi-tenant isolation.
    /// Set once during creation and cannot be modified.
    /// </summary>
    public Guid TenantId { get; protected set; }

    protected TenantEntity()
    {
        // Required for EF Core
    }

    protected TenantEntity(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
        {
            throw new ArgumentException("TenantId cannot be empty.", nameof(tenantId));
        }

        Id = Guid.NewGuid();
        TenantId = tenantId;
    }
}

