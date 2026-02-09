using AccountingService.Application.DTOs;
using AccountingService.Domain.Common;
using MediatR;

namespace AccountingService.Application.Commands.RecordPayment;

/// <summary>
/// Command to record a payment received
/// Idempotent via PaymentReferenceId
/// </summary>
public record RecordPaymentCommand(
    string PaymentReferenceId,
    Guid AccountId,
    decimal Amount,
    DateTime PaymentDate,
    string? PaymentMode = null) : IRequest<Result<LedgerTransactionDto>>;
