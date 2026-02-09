using AccountingService.Application.Commands.RecordPayment;
using AccountingService.Application.Commands.RecordRideCharge;
using AccountingService.Application.DTOs;
using AccountingService.Application.Queries.GetLedgerTransaction;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccountingService.API.Controllers;

/// <summary>
/// Ledger transaction endpoints for recording ride charges and payments
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class LedgerController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<LedgerController> _logger;

    public LedgerController(IMediator mediator, ILogger<LedgerController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Record a ride service charge
    /// Idempotent: Same ride ID can only be charged once per account
    /// </summary>
    /// <param name="command">Ride charge details</param>
    /// <returns>Ledger transaction with double-entry details</returns>
    [HttpPost("charges")]
    [ProducesResponseType(typeof(LedgerTransactionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(LedgerTransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordRideCharge([FromBody] RecordRideChargeCommand command)
    {
        _logger.LogInformation(
            "Recording ride charge - Account: {AccountId}, Ride: {RideId}, Amount: {Amount}",
            command.AccountId, command.RideId, command.FareAmount);

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            _logger.LogWarning(
                "Failed to record ride charge - Ride: {RideId}, Error: {Error}",
                command.RideId, result.Error);
            return BadRequest(new { error = result.Error });
        }

        // Check if this is an idempotent response (transaction already exists)
        // by checking if CreatedAt is more than 1 second old
        var isIdempotentResponse = (DateTime.UtcNow - result.Value.CreatedAt).TotalSeconds > 1;

        if (isIdempotentResponse)
        {
            _logger.LogInformation(
                "Ride charge already recorded (idempotent) - Transaction: {TransactionId}, Ride: {RideId}",
                result.Value.Id, command.RideId);

            // Return 200 OK for idempotent requests (not 201 Created)
            return Ok(result.Value);
        }

        return CreatedAtAction(
            nameof(GetLedgerTransaction),
            new { transactionId = result.Value.Id },
            result.Value);
    }

    /// <summary>
    /// Record a payment received
    /// Idempotent: Same payment reference ID can only be recorded once per account
    /// </summary>
    /// <param name="command">Payment details</param>
    /// <returns>Ledger transaction with double-entry details</returns>
    [HttpPost("payments")]
    [ProducesResponseType(typeof(LedgerTransactionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(LedgerTransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentCommand command)
    {
        _logger.LogInformation(
            "Recording payment - Account: {AccountId}, Reference: {PaymentRef}, Amount: {Amount}",
            command.AccountId, command.PaymentReferenceId, command.Amount);

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            _logger.LogWarning(
                "Failed to record payment - Reference: {PaymentRef}, Error: {Error}",
                command.PaymentReferenceId, result.Error);
            return BadRequest(new { error = result.Error });
        }

        // Check if this is an idempotent response (transaction already exists)
        // by checking if CreatedAt is more than 1 second old
        var isIdempotentResponse = (DateTime.UtcNow - result.Value.CreatedAt).TotalSeconds > 1;

        if (isIdempotentResponse)
        {
            _logger.LogInformation(
                "Payment already recorded (idempotent) - Transaction: {TransactionId}, Reference: {PaymentRef}",
                result.Value.Id, command.PaymentReferenceId);

            // Return 200 OK for idempotent requests (not 201 Created)
            return Ok(result.Value);
        }

        return CreatedAtAction(
            nameof(GetLedgerTransaction),
            new { transactionId = result.Value.Id },
            result.Value);
    }

    /// <summary>
    /// Get ledger transaction by ID
    /// </summary>
    /// <param name="transactionId">Transaction identifier</param>
    /// <returns>Ledger transaction with all entries</returns>
    [HttpGet("transactions/{transactionId:guid}")]
    [ProducesResponseType(typeof(LedgerTransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLedgerTransaction(Guid transactionId)
    {
        _logger.LogInformation("Retrieving ledger transaction: {TransactionId}", transactionId);

        var result = await _mediator.Send(new GetLedgerTransactionQuery(transactionId));

        if (result.IsFailure)
        {
            _logger.LogWarning(
                "Ledger transaction not found: {TransactionId}",
                transactionId);
            return NotFound(new { error = result.Error });
        }

        return Ok(result.Value);
    }
}
