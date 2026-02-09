using AccountingService.Infrastructure.Services;

namespace AccountingService.API.Middleware;

/// <summary>
/// Middleware to extract and validate tenant ID from request headers.
/// Sets tenant context for the current request scope.
/// </summary>
public class TenantMiddleware
{
    private const string TenantIdHeader = "X-Tenant-ID";
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantMiddleware> _logger;

    public TenantMiddleware(RequestDelegate next, ILogger<TenantMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, TenantService tenantService)
    {
        // Skip tenant validation for health check and swagger endpoints
        if (context.Request.Path.StartsWithSegments("/health") ||
            context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(TenantIdHeader, out var tenantIdHeaderValue))
        {
            _logger.LogWarning("Missing {HeaderName} header in request to {Path}",
                TenantIdHeader, context.Request.Path);

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new
            {
                error = new
                {
                    code = "MISSING_TENANT_ID",
                    message = $"Header '{TenantIdHeader}' is required."
                }
            });
            return;
        }

        if (!Guid.TryParse(tenantIdHeaderValue, out var tenantId))
        {
            _logger.LogWarning("Invalid {HeaderName} header value: {Value}",
                TenantIdHeader, tenantIdHeaderValue);

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new
            {
                error = new
                {
                    code = "INVALID_TENANT_ID",
                    message = $"Header '{TenantIdHeader}' must be a valid GUID."
                }
            });
            return;
        }

        tenantService.SetTenant(tenantId);

        _logger.LogDebug("Tenant context set to {TenantId} for request {Path}",
            tenantId, context.Request.Path);

        await _next(context);
    }
}
