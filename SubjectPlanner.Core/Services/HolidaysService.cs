using Microsoft.Extensions.Configuration;
using SubjectPlanner.Core.Helpers;

namespace SubjectPlanner.Core.Services;

public class HolidaysService
{
    private readonly IConfiguration _config;

    public List<Schedule>? Schedules { get; set; } = [];

    public HolidaysService(IConfiguration config)
    {
        _config = config;
    }

    public List<Holiday> GetHolidays(DateTime dateFrom, DateTime dateTo)
    {
        List<DateOnly> holidays = [];

        int years = dateTo.Year - dateFrom.Year + 1;

        for (int i = 0; i < years; i++)
        {
            int year = dateFrom.Year + i;
            List<HolidaysConfig> configHolidays = _config
                .GetSection("holidays")
                        .Get<List<HolidaysConfig>>() ?? [];

            List<DateOnly> l =
            configHolidays
                .Where(h =>
                    h.Date >= new DateOnly(0001, dateFrom.Month, dateFrom.Day)
                    && h.Date <= new DateOnly(0001, dateTo.Month, dateTo.Day))
                .Select(s => HolidayDate(s, year) )
                .ToList();

            holidays.AddRange(l);
        }

        var k = holidays
            .Where(h => Schedules
                .Select(s => s.Day)
                .Contains(h.DayOfWeek) && h >= DateOnly.FromDateTime(dateFrom) && h <= DateOnly.FromDateTime(dateTo))
            .Select(h => new Holiday { Date = h, AffectingHours = AffectingHours(h) })
            .ToList();


        return k;
    }
    
    private DateOnly HolidayDate(HolidaysConfig holidayConfig, int year)
    {
        Holiday holiday = new();
        DateOnly newDate = new(year, holidayConfig.Date.Month, holidayConfig.Date.Day);

        if (!holidayConfig.IsReligious)
        {
            if (newDate == new DateOnly(newDate.Year, 05, 01) && newDate.DayOfWeek == DayOfWeek.Sunday)
            {
                holiday.Date = newDate.AddDays(1);
            }
            else if (newDate.DayOfWeek == DayOfWeek.Tuesday || newDate.DayOfWeek == DayOfWeek.Wednesday)
            {
                holiday.Date = newDate.AddDays(((int)newDate.DayOfWeek - 1) * -1);
            }
            else if (newDate.DayOfWeek == DayOfWeek.Thursday || newDate.DayOfWeek == DayOfWeek.Friday)
            {
                holiday.Date = newDate.AddDays(7 - (int)newDate.DayOfWeek + 1);
            }
        } else {
            holiday.Date = newDate;
        }
        return holiday.Date;
    }

    private double AffectingHours(DateOnly holiday) {
        return Schedules
            .Where(s => s.Day == holiday.DayOfWeek)
            .Sum(s => (s.HourTo - s.HourFrom).Hours);
    }
}