using AccountingService.API.Middleware;
using AccountingService.Application.Behaviors;
using AccountingService.Application.Interfaces;
using AccountingService.Domain.Services;
using AccountingService.Infrastructure.Persistence;
using AccountingService.Infrastructure.Services;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Enrichers.CorrelationId;

// Configure Serilog early to capture startup logs
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
        .Build())
    .Enrich.FromLogContext()
    .Enrich.WithCorrelationId()
    .CreateLogger();

try
{
    Log.Information("Starting AccountingService API");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for logging
    builder.Host.UseSerilog();

    // Add controllers
    builder.Services.AddControllers();

    // Add database context
    builder.Services.AddDbContext<AccountingDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("AccountingDb"),
            npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
                npgsqlOptions.CommandTimeout(30);
            }));

    builder.Services.AddScoped<IAccountingDbContext>(provider =>
        provider.GetRequiredService<AccountingDbContext>());

    // Add tenant service
    builder.Services.AddScoped<ICurrentTenant, TenantService>();

    // Add ledger service
    builder.Services.AddScoped<ILedgerService, LedgerService>();

    // Add MediatR with behaviors
    builder.Services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
        cfg.RegisterServicesFromAssembly(
            AppDomain.CurrentDomain.Load("AccountingService.Application"));
    });

    // Register MediatR pipeline behaviors (order matters!)
    builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));

    // Add FluentValidation
    builder.Services.AddValidatorsFromAssembly(
        AppDomain.CurrentDomain.Load("AccountingService.Application"));

    // Add OpenTelemetry
    builder.Services.AddOpenTelemetry()
        .ConfigureResource(resource => resource
            .AddService("AccountingService"))
        .WithMetrics(metrics => metrics
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            .AddPrometheusExporter())
        .WithTracing(tracing => tracing
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddEntityFrameworkCoreInstrumentation()
            .AddSource("AccountingService"));

    // Add Swagger/OpenAPI with multi-tenancy header
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Accounting Service API",
            Version = "v1",
            Description = "Multi-tenant dual-entry accounting and invoicing service"
        });

        // Add X-Tenant-ID header parameter to all operations
        c.AddSecurityDefinition("X-Tenant-ID", new OpenApiSecurityScheme
        {
            Name = "X-Tenant-ID",
            Type = SecuritySchemeType.ApiKey,
            In = ParameterLocation.Header,
            Description = "Tenant identifier (GUID)"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "X-Tenant-ID"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    var app = builder.Build();

    // Configure the HTTP request pipeline

    // Use custom middleware (order matters!)
    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseMiddleware<ErrorHandlingMiddleware>();
    app.UseMiddleware<TenantMiddleware>();

    // Use Swagger in all environments for now
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Accounting Service API v1");
    });

    app.UseHttpsRedirection();

    // Use Serilog request logging
    app.UseSerilogRequestLogging();

    app.UseAuthorization();

    app.MapControllers();

    // Map Prometheus metrics endpoint
    app.MapPrometheusScrapingEndpoint();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application startup failed");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
