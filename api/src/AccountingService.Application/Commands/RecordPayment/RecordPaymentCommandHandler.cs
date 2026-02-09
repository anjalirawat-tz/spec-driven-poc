using AccountingService.Application.DTOs;
using AccountingService.Domain.Common;
using AccountingService.Domain.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AccountingService.Application.Commands.RecordPayment;

/// <summary>
/// Handler for recording payment transactions
/// </summary>
public class RecordPaymentCommandHandler : IRequestHandler<RecordPaymentCommand, Result<LedgerTransactionDto>>
{
    private readonly ILedgerService _ledgerService;
    private readonly ILogger<RecordPaymentCommandHandler> _logger;

    public RecordPaymentCommandHandler(
        ILedgerService ledgerService,
        ILogger<RecordPaymentCommandHandler> logger)
    {
        _ledgerService = ledgerService;
        _logger = logger;
    }

    public async Task<Result<LedgerTransactionDto>> Handle(
        RecordPaymentCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation(
                "Processing payment recording - Account: {AccountId}, Reference: {PaymentRef}",
                request.AccountId, request.PaymentReferenceId);

            var transaction = await _ledgerService.RecordPaymentAsync(
                request.AccountId,
                request.PaymentReferenceId,
                request.Amount,
                request.PaymentDate,
                request.PaymentMode,
                cancellationToken);

            var dto = LedgerTransactionDto.FromDomain(transaction);

            return Result.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Payment recording failed - {Message}", ex.Message);
            return Result.Failure<LedgerTransactionDto>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error recording payment");
            return Result.Failure<LedgerTransactionDto>("An error occurred while recording the payment");
        }
    }
}
