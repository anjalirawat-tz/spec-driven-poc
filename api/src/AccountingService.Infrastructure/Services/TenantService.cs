using AccountingService.Application.Interfaces;

namespace AccountingService.Infrastructure.Services;

/// <summary>
/// Implementation of ICurrentTenant using HTTP context.
/// Extracted from X-Tenant-ID header by TenantMiddleware.
/// </summary>
public class TenantService : ICurrentTenant
{
    private Guid _tenantId;

    public Guid Id
    {
        get
        {
            if (_tenantId == Guid.Empty)
            {
                throw new InvalidOperationException("Tenant context is not available. Ensure TenantMiddleware is configured.");
            }
            return _tenantId;
        }
    }

    public bool IsAvailable => _tenantId != Guid.Empty;

    public void SetTenant(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
        {
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
        }

        _tenantId = tenantId;
    }
}
