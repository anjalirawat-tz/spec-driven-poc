namespace AccountingService.Application.Interfaces;

/// <summary>
/// Provides access to the current tenant context.
/// Used for multi-tenant isolation throughout the application.
/// </summary>
public interface ICurrentTenant
{
    /// <summary>
    /// Gets the current tenant ID from the request context.
    /// </summary>
    Guid Id { get; }

    /// <summary>
    /// Checks if a tenant context is available.
    /// </summary>
    bool IsAvailable { get; }
}
