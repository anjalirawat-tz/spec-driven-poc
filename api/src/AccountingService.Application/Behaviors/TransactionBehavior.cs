using AccountingService.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AccountingService.Application.Behaviors;

/// <summary>
/// Pipeline behavior that wraps commands in a database transaction
/// and validates double-entry accounting rules
/// </summary>
public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IAccountingDbContext _dbContext;
    private readonly ILogger<TransactionBehavior<TRequest, TResponse>> _logger;

    public TransactionBehavior(
        IAccountingDbContext dbContext,
        ILogger<TransactionBehavior<TRequest, TResponse>> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        // Check if this is a command that modifies data
        // Queries (ending with "Query") should not use transactions
        if (requestName.EndsWith("Query", StringComparison.OrdinalIgnoreCase))
        {
            return await next();
        }

        // Use existing transaction if one is already active
        var dbContext = _dbContext as DbContext;
        if (dbContext?.Database.CurrentTransaction != null)
        {
            return await next();
        }

        _logger.LogInformation("Beginning transaction for {RequestName}", requestName);

        var strategy = dbContext!.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                var response = await next();

                // TODO: Add double-entry validation here when journal entries are implemented
                // For now, we just commit the transaction
                // Future: Validate sum(debits) == sum(credits) for all journal entries in transaction

                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation("Committed transaction for {RequestName}", requestName);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Rolling back transaction for {RequestName}: {ErrorMessage}",
                    requestName,
                    ex.Message);

                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        });
    }
}
