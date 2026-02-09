using AccountingService.Application.DTOs;
using AccountingService.Domain.Aggregates.AccountAggregate;
using AccountingService.Domain.Common;
using MediatR;

namespace AccountingService.Application.Commands.UpdateAccount;

/// <summary>
/// Command to update an existing account
/// </summary>
public record UpdateAccountCommand(
    Guid Id,
    string? Name = null,
    string? Description = null,
    AccountStatus? Status = null
) : IRequest<Result<AccountDto>>;
