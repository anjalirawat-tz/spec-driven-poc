using AccountingService.Application.DTOs;
using AccountingService.Application.Interfaces;
using AccountingService.Domain.Aggregates.LedgerAggregate;
using AccountingService.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountingService.Application.Queries.GetLedgerTransaction;

/// <summary>
/// Handler for GetLedgerTransactionQuery
/// </summary>
public class GetLedgerTransactionQueryHandler : IRequestHandler<GetLedgerTransactionQuery, Result<LedgerTransactionDto>>
{
    private readonly IAccountingDbContext _context;

    public GetLedgerTransactionQueryHandler(IAccountingDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LedgerTransactionDto>> Handle(
        GetLedgerTransactionQuery request,
        CancellationToken cancellationToken)
    {
        var transaction = await _context.Set<LedgerTransaction>()
            .Include(t => t.Entries)
            .FirstOrDefaultAsync(t => t.Id == request.TransactionId, cancellationToken);

        if (transaction == null)
        {
            return Result.Failure<LedgerTransactionDto>(
                $"Ledger transaction with ID '{request.TransactionId}' not found");
        }

        return Result.Success(LedgerTransactionDto.FromDomain(transaction));
    }
}
