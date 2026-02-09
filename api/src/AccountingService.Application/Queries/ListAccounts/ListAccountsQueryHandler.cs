using AccountingService.Application.DTOs;
using AccountingService.Application.Interfaces;
using AccountingService.Domain.Aggregates.AccountAggregate;
using AccountingService.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountingService.Application.Queries.ListAccounts;

/// <summary>
/// Handler for ListAccountsQuery
/// </summary>
public class ListAccountsQueryHandler : IRequestHandler<ListAccountsQuery, Result<List<AccountDto>>>
{
    private readonly IAccountingDbContext _context;

    public ListAccountsQueryHandler(IAccountingDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<AccountDto>>> Handle(ListAccountsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Set<Account>().AsQueryable();

        // Apply filters
        if (request.Type.HasValue)
        {
            query = query.Where(a => a.Type == request.Type.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(a => a.Status == request.Status.Value);
        }

        // Apply pagination
        var accounts = await query
            .OrderBy(a => a.Code)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = accounts.Select(AccountDto.FromDomain).ToList();

        return Result<List<AccountDto>>.Success(dtos);
    }
}
