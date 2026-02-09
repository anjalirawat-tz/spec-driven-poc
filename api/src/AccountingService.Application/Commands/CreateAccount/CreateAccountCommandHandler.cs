using AccountingService.Application.DTOs;
using AccountingService.Application.Interfaces;
using AccountingService.Domain.Aggregates.AccountAggregate;
using AccountingService.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountingService.Application.Commands.CreateAccount;

/// <summary>
/// Handler for CreateAccountCommand
/// </summary>
public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, Result<AccountDto>>
{
    private readonly IAccountingDbContext _context;
    private readonly ICurrentTenant _currentTenant;

    public CreateAccountCommandHandler(
        IAccountingDbContext context,
        ICurrentTenant currentTenant)
    {
        _context = context;
        _currentTenant = currentTenant;
    }

    public async Task<Result<AccountDto>> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        // Check if account code already exists for this tenant
        var codeExists = await _context.Set<Account>()
            .AnyAsync(a => a.Code == request.Code, cancellationToken);

        if (codeExists)
        {
            return Result.Failure<AccountDto>($"Account code '{request.Code}' already exists");
        }

        // If parent account specified, verify it exists and belongs to same tenant
        if (request.ParentAccountId.HasValue)
        {
            var parentExists = await _context.Set<Account>()
                .AnyAsync(a => a.Id == request.ParentAccountId.Value, cancellationToken);

            if (!parentExists)
            {
                return Result.Failure<AccountDto>($"Parent account '{request.ParentAccountId}' not found");
            }
        }

        // Create account using factory method
        var account = Account.Create(
            _currentTenant.Id,
            request.Code,
            request.Name,
            request.Type,
            request.Currency,
            request.Description,
            request.ParentAccountId);

        _context.Set<Account>().Add(account);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AccountDto>.Success(AccountDto.FromDomain(account));
    }
}
