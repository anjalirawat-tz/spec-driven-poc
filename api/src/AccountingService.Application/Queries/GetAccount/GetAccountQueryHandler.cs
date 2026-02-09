using AccountingService.Application.DTOs;
using AccountingService.Application.Interfaces;
using AccountingService.Domain.Aggregates.AccountAggregate;
using AccountingService.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountingService.Application.Queries.GetAccount;

/// <summary>
/// Handler for GetAccountQuery
/// </summary>
public class GetAccountQueryHandler : IRequestHandler<GetAccountQuery, Result<AccountDto>>
{
    private readonly IAccountingDbContext _context;

    public GetAccountQueryHandler(IAccountingDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AccountDto>> Handle(GetAccountQuery request, CancellationToken cancellationToken)
    {
        var account = await _context.Set<Account>()
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (account == null)
        {
            return Result.Failure<AccountDto>($"Account with ID '{request.Id}' not found");
        }

        return Result<AccountDto>.Success(AccountDto.FromDomain(account));
    }
}
