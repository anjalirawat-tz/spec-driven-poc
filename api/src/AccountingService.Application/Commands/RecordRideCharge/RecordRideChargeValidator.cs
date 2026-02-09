using FluentValidation;

namespace AccountingService.Application.Commands.RecordRideCharge;

/// <summary>
/// Validator for RecordRideChargeCommand
/// </summary>
public class RecordRideChargeValidator : AbstractValidator<RecordRideChargeCommand>
{
    public RecordRideChargeValidator()
    {
        RuleFor(x => x.AccountId)
            .NotEmpty().WithMessage("Account ID is required");

        RuleFor(x => x.RideId)
            .NotEmpty().WithMessage("Ride ID is required")
            .MaximumLength(100).WithMessage("Ride ID must not exceed 100 characters");

        RuleFor(x => x.FareAmount)
            .GreaterThan(0).WithMessage("Fare amount must be greater than zero")
            .LessThanOrEqualTo(999999.99m).WithMessage("Fare amount exceeds maximum allowed");

        RuleFor(x => x.ServiceDate)
            .NotEmpty().WithMessage("Service date is required")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1))
                .WithMessage("Service date cannot be more than 1 day in the future");

        RuleFor(x => x.FleetId)
            .MaximumLength(100).WithMessage("Fleet ID must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.FleetId));
    }
}
