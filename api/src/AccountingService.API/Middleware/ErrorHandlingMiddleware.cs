using System.Net;
using System.Text.Json;

namespace AccountingService.API.Middleware;

/// <summary>
/// Global exception handling middleware.
/// Catches unhandled exceptions and returns consistent error responses.
/// </summary>
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred while processing request {Method} {Path}",
                context.Request.Method, context.Request.Path);

            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, errorCode, message) = exception switch
        {
            ArgumentException => (HttpStatusCode.BadRequest, "INVALID_ARGUMENT", exception.Message),
            InvalidOperationException => (HttpStatusCode.BadRequest, "INVALID_OPERATION", exception.Message),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "UNAUTHORIZED", "Access denied"),
            KeyNotFoundException => (HttpStatusCode.NotFound, "NOT_FOUND", "Resource not found"),
            _ => (HttpStatusCode.InternalServerError, "INTERNAL_ERROR", "An error occurred while processing your request")
        };

        context.Response.StatusCode = (int)statusCode;

        var correlationId = context.Response.Headers["X-Correlation-ID"].FirstOrDefault()
                           ?? Guid.NewGuid().ToString();

        var errorResponse = new
        {
            error = new
            {
                code = errorCode,
                message,
                details = _environment.IsDevelopment() ? exception.ToString() : null
            },
            traceId = correlationId
        };

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        await context.Response.WriteAsJsonAsync(errorResponse, jsonOptions);
    }
}
