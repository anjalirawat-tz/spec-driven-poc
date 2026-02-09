using AccountingService.Application.DTOs;
using AccountingService.Application.Interfaces;
using AccountingService.Domain.Aggregates.LedgerAggregate;
using AccountingService.Domain.Common;
using AccountingService.Domain.Services;
using MediatR;

namespace AccountingService.Application.Commands.RecordRideCharge;

/// <summary>
/// Handler for RecordRideChargeCommand
/// Implements idempotency - same ride ID can only be charged once per account
/// </summary>
public class RecordRideChargeCommandHandler : IRequestHandler<RecordRideChargeCommand, Result<LedgerTransactionDto>>
{
    private readonly ILedgerService _ledgerService;
    private readonly IAccountingDbContext _context;

    public RecordRideChargeCommandHandler(
        ILedgerService ledgerService,
        IAccountingDbContext context)
    {
        _ledgerService = ledgerService;
        _context = context;
    }

    public async Task<Result<LedgerTransactionDto>> Handle(
        RecordRideChargeCommand request,
        CancellationToken cancellationToken)
    {
        // Record the ride charge (idempotency handled in LedgerService)
        var transaction = await _ledgerService.RecordRideChargeAsync(
            request.AccountId,
            request.RideId,
            request.FareAmount,
            request.ServiceDate,
            request.FleetId,
            cancellationToken);

        return Result.Success(LedgerTransactionDto.FromDomain(transaction));
    }
}
