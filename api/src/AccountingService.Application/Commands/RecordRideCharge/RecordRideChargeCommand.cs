using AccountingService.Application.DTOs;
using AccountingService.Domain.Common;
using MediatR;

namespace AccountingService.Application.Commands.RecordRideCharge;

/// <summary>
/// Command to record a ride service charge
/// </summary>
public record RecordRideChargeCommand(
    Guid AccountId,
    string RideId,
    decimal FareAmount,
    DateTime ServiceDate,
    string? FleetId = null
) : IRequest<Result<LedgerTransactionDto>>;
