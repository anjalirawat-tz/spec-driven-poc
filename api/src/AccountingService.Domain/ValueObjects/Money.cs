namespace AccountingService.Domain.ValueObjects;

/// <summary>
/// Value object representing a monetary amount with currency.
/// Encapsulates financial calculations and prevents currency mixing.
/// Uses decimal for precision (required for accounting).
/// </summary>
public record Money
{
    private const string DefaultCurrency = "USD";

    public decimal Amount { get; init; }
    public string Currency { get; init; }

    public Money() : this(0m, DefaultCurrency)
    {
    }

    public Money(decimal amount, string currency = DefaultCurrency)
    {
        if (string.IsNullOrWhiteSpace(currency))
        {
            throw new ArgumentException("Currency cannot be null or empty.", nameof(currency));
        }

        if (currency.Length != 3)
        {
            throw new ArgumentException("Currency must be a 3-letter code.", nameof(currency));
        }

        Amount = amount;
        Currency = currency.ToUpperInvariant();
    }

    public static Money Zero => new(0m, DefaultCurrency);

    public static Money operator +(Money a, Money b)
    {
        ValidateSameCurrency(a, b);
        return new Money(a.Amount + b.Amount, a.Currency);
    }

    public static Money operator -(Money a, Money b)
    {
        ValidateSameCurrency(a, b);
        return new Money(a.Amount - b.Amount, a.Currency);
    }

    public static Money operator *(Money money, decimal multiplier)
    {
        return new Money(money.Amount * multiplier, money.Currency);
    }

    public static Money operator /(Money money, decimal divisor)
    {
        if (divisor == 0)
        {
            throw new DivideByZeroException("Cannot divide money by zero.");
        }

        return new Money(money.Amount / divisor, money.Currency);
    }

    public static bool operator >(Money a, Money b)
    {
        ValidateSameCurrency(a, b);
        return a.Amount > b.Amount;
    }

    public static bool operator <(Money a, Money b)
    {
        ValidateSameCurrency(a, b);
        return a.Amount < b.Amount;
    }

    public static bool operator >=(Money a, Money b)
    {
        ValidateSameCurrency(a, b);
        return a.Amount >= b.Amount;
    }

    public static bool operator <=(Money a, Money b)
    {
        ValidateSameCurrency(a, b);
        return a.Amount <= b.Amount;
    }

    public bool IsPositive() => Amount > 0;
    public bool IsNegative() => Amount < 0;
    public bool IsZero() => Amount == 0;

    public Money Negate() => new(-Amount, Currency);

    public override string ToString() => $"{Amount:N2} {Currency}";

    private static void ValidateSameCurrency(Money a, Money b)
    {
        if (a.Currency != b.Currency)
        {
            throw new InvalidOperationException(
                $"Cannot perform operation on different currencies: {a.Currency} and {b.Currency}");
        }
    }
}
