using FluentValidation;

namespace AccountingService.Application.Commands.RecordPayment;

/// <summary>
/// Validator for RecordPaymentCommand
/// </summary>
public class RecordPaymentValidator : AbstractValidator<RecordPaymentCommand>
{
    public RecordPaymentValidator()
    {
        RuleFor(x => x.PaymentReferenceId)
            .NotEmpty()
            .WithMessage("Payment reference ID is required")
            .MaximumLength(100)
            .WithMessage("Payment reference ID must not exceed 100 characters");

        RuleFor(x => x.AccountId)
            .NotEmpty()
            .WithMessage("Account ID is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Payment amount must be greater than zero")
            .LessThanOrEqualTo(999999.99m)
            .WithMessage("Payment amount must not exceed 999999.99");

        RuleFor(x => x.PaymentDate)
            .NotEmpty()
            .WithMessage("Payment date is required")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1))
            .WithMessage("Payment date cannot be more than 1 day in the future");

        RuleFor(x => x.PaymentMode)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.PaymentMode))
            .WithMessage("Payment mode must not exceed 50 characters");
    }
}
