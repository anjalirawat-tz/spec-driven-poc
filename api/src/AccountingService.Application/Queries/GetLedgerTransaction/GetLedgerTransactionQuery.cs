using AccountingService.Application.DTOs;
using AccountingService.Domain.Common;
using MediatR;

namespace AccountingService.Application.Queries.GetLedgerTransaction;

/// <summary>
/// Query to retrieve a ledger transaction by ID
/// </summary>
public record GetLedgerTransactionQuery(Guid TransactionId) : IRequest<Result<LedgerTransactionDto>>;
