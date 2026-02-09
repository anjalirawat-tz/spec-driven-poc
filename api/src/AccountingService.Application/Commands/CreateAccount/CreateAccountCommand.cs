using AccountingService.Application.DTOs;
using AccountingService.Domain.Aggregates.AccountAggregate;
using AccountingService.Domain.Common;
using MediatR;

namespace AccountingService.Application.Commands.CreateAccount;

/// <summary>
/// Command to create a new account
/// </summary>
public record CreateAccountCommand(
    string Code,
    string Name,
    AccountType Type,
    string Currency = "USD",
    string? Description = null,
    Guid? ParentAccountId = null
) : IRequest<Result<AccountDto>>;
