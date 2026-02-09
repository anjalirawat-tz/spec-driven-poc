using AccountingService.Application.DTOs;
using AccountingService.Application.Interfaces;
using AccountingService.Domain.Aggregates.AccountAggregate;
using AccountingService.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountingService.Application.Commands.UpdateAccount;

/// <summary>
/// Handler for UpdateAccountCommand
/// </summary>
public class UpdateAccountCommandHandler : IRequestHandler<UpdateAccountCommand, Result<AccountDto>>
{
    private readonly IAccountingDbContext _context;

    public UpdateAccountCommandHandler(IAccountingDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AccountDto>> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Set<Account>()
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (account == null)
        {
            return Result.Failure<AccountDto>($"Account with ID '{request.Id}' not found");
        }

        account.Update(request.Name, request.Description, request.Status);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<AccountDto>.Success(AccountDto.FromDomain(account));
    }
}
