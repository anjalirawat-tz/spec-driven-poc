namespace AccountingService.Domain.ValueObjects;

/// <summary>
/// Value object representing a date range.
/// Used for billing periods, statement generation, and date-based queries.
/// </summary>
public record DateRange
{
    public DateTime Start { get; init; }
    public DateTime End { get; init; }

    public DateRange(DateTime start, DateTime end)
    {
        if (end < start)
        {
            throw new ArgumentException("End date must be greater than or equal to start date.", nameof(end));
        }

        Start = start.ToUniversalTime();
        End = end.ToUniversalTime();
    }

    public static DateRange Create(DateTime start, DateTime end) => new(start, end);

    public static DateRange Today()
    {
        var today = DateTime.UtcNow.Date;
        return new DateRange(today, today.AddDays(1).AddTicks(-1));
    }

    public static DateRange ThisWeek()
    {
        var today = DateTime.UtcNow.Date;
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
        var endOfWeek = startOfWeek.AddDays(7).AddTicks(-1);
        return new DateRange(startOfWeek, endOfWeek);
    }

    public static DateRange ThisMonth()
    {
        var today = DateTime.UtcNow.Date;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);
        return new DateRange(startOfMonth, endOfMonth);
    }

    public static DateRange LastMonth()
    {
        var today = DateTime.UtcNow.Date;
        var startOfLastMonth = new DateTime(today.Year, today.Month, 1).AddMonths(-1);
        var endOfLastMonth = startOfLastMonth.AddMonths(1).AddTicks(-1);
        return new DateRange(startOfLastMonth, endOfLastMonth);
    }

    public bool Contains(DateTime date)
    {
        var utcDate = date.ToUniversalTime();
        return utcDate >= Start && utcDate <= End;
    }

    public int Days => (End.Date - Start.Date).Days + 1;

    public bool Overlaps(DateRange other)
    {
        return Start <= other.End && other.Start <= End;
    }

    public override string ToString() => $"{Start:yyyy-MM-dd} to {End:yyyy-MM-dd}";
}
