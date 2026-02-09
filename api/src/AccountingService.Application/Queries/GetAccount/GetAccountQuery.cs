using AccountingService.Application.DTOs;
using AccountingService.Domain.Common;
using MediatR;

namespace AccountingService.Application.Queries.GetAccount;

/// <summary>
/// Query to retrieve a single account by ID
/// </summary>
public record GetAccountQuery(Guid Id) : IRequest<Result<AccountDto>>;
