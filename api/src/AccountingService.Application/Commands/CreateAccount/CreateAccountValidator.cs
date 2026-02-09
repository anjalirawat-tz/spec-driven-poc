using FluentValidation;

namespace AccountingService.Application.Commands.CreateAccount;

/// <summary>
/// Validator for CreateAccountCommand
/// </summary>
public class CreateAccountValidator : AbstractValidator<CreateAccountCommand>
{
    public CreateAccountValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Account code is required")
            .MaximumLength(20).WithMessage("Account code must not exceed 20 characters")
            .Matches("^[A-Z0-9-]+$").WithMessage("Account code must contain only uppercase letters, numbers, and hyphens");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Account name is required")
            .MaximumLength(200).WithMessage("Account name must not exceed 200 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid account type");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .Length(3).WithMessage("Currency must be a 3-letter ISO code")
            .Matches("^[A-Z]{3}$").WithMessage("Currency must be uppercase ISO code (e.g., USD, EUR, GBP)");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
