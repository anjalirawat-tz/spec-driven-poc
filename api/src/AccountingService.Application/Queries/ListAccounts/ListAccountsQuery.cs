using AccountingService.Application.DTOs;
using AccountingService.Domain.Aggregates.AccountAggregate;
using AccountingService.Domain.Common;
using MediatR;

namespace AccountingService.Application.Queries.ListAccounts;

/// <summary>
/// Query to list accounts with optional filtering
/// </summary>
public record ListAccountsQuery(
    AccountType? Type = null,
    AccountStatus? Status = null,
    int PageNumber = 1,
    int PageSize = 50
) : IRequest<Result<List<AccountDto>>>;
