using AccountingService.Application.Interfaces;
using AccountingService.Domain.Aggregates.AccountAggregate;
using AccountingService.Domain.Aggregates.LedgerAggregate;
using AccountingService.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AccountingService.Infrastructure.Services;

/// <summary>
/// Ledger service implementing double-entry bookkeeping with idempotency
/// </summary>
public class LedgerService : ILedgerService
{
    private readonly IAccountingDbContext _context;
    private readonly ICurrentTenant _currentTenant;
    private readonly ILogger<LedgerService> _logger;

    public LedgerService(
        IAccountingDbContext context,
        ICurrentTenant currentTenant,
        ILogger<LedgerService> logger)
    {
        _context = context;
        _currentTenant = currentTenant;
        _logger = logger;
    }

    public async Task<LedgerTransaction> RecordRideChargeAsync(
        Guid accountId,
        string rideId,
        decimal fareAmount,
        DateTime serviceDate,
        string? fleetId = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Recording ride charge - Account: {AccountId}, Ride: {RideId}, Amount: {Amount}",
            accountId, rideId, fareAmount);

        // Check idempotency - has this ride already been charged?
        var idempotencyKey = $"ride:{rideId}";
        var existingTransaction = await _context.Set<LedgerTransaction>()
            .Include(t => t.Entries)
            .FirstOrDefaultAsync(
                t => t.AccountId == accountId && t.IdempotencyKey == idempotencyKey,
                cancellationToken);

        if (existingTransaction != null)
        {
            _logger.LogInformation(
                "Ride charge already recorded (idempotent) - Transaction: {TransactionId}",
                existingTransaction.Id);
            return existingTransaction;
        }

        // Verify account exists
        var accountExists = await _context.Set<Account>()
            .AnyAsync(a => a.Id == accountId, cancellationToken);

        if (!accountExists)
        {
            throw new InvalidOperationException($"Account '{accountId}' not found");
        }

        // Create double-entry transaction
        var transaction = LedgerTransaction.CreateRideCharge(
            _currentTenant.Id,
            accountId,
            rideId,
            fareAmount,
            serviceDate,
            fleetId);

        _context.Set<LedgerTransaction>().Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Ride charge recorded successfully - Transaction: {TransactionId}",
            transaction.Id);

        return transaction;
    }

    public async Task<LedgerTransaction> RecordPaymentAsync(
        Guid accountId,
        string paymentReferenceId,
        decimal amount,
        DateTime paymentDate,
        string? paymentMode = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Recording payment - Account: {AccountId}, Reference: {PaymentRef}, Amount: {Amount}",
            accountId, paymentReferenceId, amount);

        // Check idempotency
        var idempotencyKey = $"payment:{paymentReferenceId}";
        var existingTransaction = await _context.Set<LedgerTransaction>()
            .Include(t => t.Entries)
            .FirstOrDefaultAsync(
                t => t.AccountId == accountId && t.IdempotencyKey == idempotencyKey,
                cancellationToken);

        if (existingTransaction != null)
        {
            _logger.LogInformation(
                "Payment already recorded (idempotent) - Transaction: {TransactionId}",
                existingTransaction.Id);
            return existingTransaction;
        }

        // Verify account exists
        var accountExists = await _context.Set<Account>()
            .AnyAsync(a => a.Id == accountId, cancellationToken);

        if (!accountExists)
        {
            throw new InvalidOperationException($"Account '{accountId}' not found");
        }

        // Create double-entry transaction
        var transaction = LedgerTransaction.CreatePayment(
            _currentTenant.Id,
            accountId,
            paymentReferenceId,
            amount,
            paymentDate,
            paymentMode);

        _context.Set<LedgerTransaction>().Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Payment recorded successfully - Transaction: {TransactionId}",
            transaction.Id);

        return transaction;
    }

    public async Task<decimal> GetAccountBalanceAsync(
        Guid accountId,
        CancellationToken cancellationToken = default)
    {
        // Balance = Sum of AR Debits - Sum of AR Credits
        // (Charges increase AR with debits, payments decrease AR with credits)
        var entries = await _context.Set<LedgerEntry>()
            .Include(e => e.LedgerTransaction)
            .Where(e => e.LedgerTransaction!.AccountId == accountId &&
                        e.AccountType == LedgerAccountType.AccountsReceivable)
            .ToListAsync(cancellationToken);

        var balance = entries.Sum(e => e.DebitAmount) - entries.Sum(e => e.CreditAmount);

        _logger.LogInformation(
            "Account balance calculated - Account: {AccountId}, Balance: {Balance}",
            accountId, balance);

        return balance;
    }
}
