using SubjectPlanner.Core.Helpers;

namespace SubjectPlanner.Core.Services;

public partial class SubjectService
{
    private readonly HolidaysService _holidayService;

    public SubjectService(HolidaysService holidaysService)
    {
        _holidayService = holidaysService;
    }
    private CalculationResult GetDays(Subject subject)
    {
        try
        {
            if (subject.Hours < 0) return new CalculationResult{ ClassDays = 0, EndDate = subject.StartDate, Holidays = []};
            
            //Ordenar los días de la semana
            subject.Schedules = subject?.Schedules?
                .OrderBy(s => s.Day)?
                .ToList();

            //Cantidad de horas por semana
            List<Schedule> schedules = subject?.Schedules ?? [];
            double hoursPerWeek = TotalHoursPerWeek(schedules);

            List<Schedule> firstWeekWorkingDays = subject?
                .Schedules?
                .Where(s => s.Day >= subject.StartDate.DayOfWeek).ToList() ?? [];

            double firstWeekNonImpartedHours = hoursPerWeek - firstWeekWorkingDays.Sum(f => (f.HourTo - f.HourFrom).Hours);

            double weeks = ((subject?.Hours ?? 0) + firstWeekNonImpartedHours) / hoursPerWeek;

            double days = (Math.Ceiling(weeks) - 1) * 7;

            double fractionalWeeks = weeks % 1;

            double totalHours = fractionalWeeks * hoursPerWeek;

            double finalHours = (fractionalWeeks == 0) ? hoursPerWeek : totalHours - 1e-9;
            double mins = finalHours;

            finalHours = Math.Ceiling(finalHours);

            int classDays = ClassDays(subject ?? new Subject());

            for (int i = 0; i < subject?.Schedules?.Count; i++)
            {
                Schedule schedule = subject.Schedules[i];

                long hours = (schedule.HourTo - schedule.HourFrom).Hours;

                if (finalHours <= hours)
                {
                    double passedHours = subject?.Schedules?.Where(s => s.Day < schedule.Day).Sum(s => (s.HourTo - s.HourFrom).TotalHours) ?? 0;

                    Schedule firstSchedule = subject?.Schedules.FirstOrDefault() ?? new Schedule();

                    DateTime actualStartDate = subject.StartDate.AddDays(firstSchedule.Day - subject.StartDate.DayOfWeek);
                    Schedule actualStartDateSchedule = subject?.Schedules?.FirstOrDefault(s => s.Day == actualStartDate.DayOfWeek) ?? new Schedule();

                    DateTime endDate = new(
                        DateOnly.FromDateTime(actualStartDate.AddDays(days)),
                        actualStartDateSchedule
                            .HourFrom
                            .AddMinutes((mins - passedHours) * 60)
                    );

                    return new CalculationResult
                    {
                        EndDate = endDate,
                        ClassDays = classDays,
                    };
                }

                finalHours -= hours;
                Schedule nextSchedule = subject.Schedules[i + 1];
                days += nextSchedule.Day - schedule.Day;
            }

            return new CalculationResult
            {
                EndDate = subject?.StartDate ?? new DateTime(0001, 01, 01),
                ClassDays = 0
            };
        }
        catch (System.Exception)
        {
            throw;
        }
    }

    private int ClassDays(Subject subject)
    {
        List<Schedule> schedules = subject?.Schedules ?? [];
        double subjectHours = subject?.Hours ?? 0;

        double totalHoursPerWeek = TotalHoursPerWeek(schedules);
        double weeks = subjectHours / totalHoursPerWeek;

        return (int)Math.Ceiling(weeks * schedules.Count);
    }

    private double TotalHoursPerWeek(List<Schedule> schedules)
    {
        return schedules?
            .Sum(s => (s.HourTo - s.HourFrom).Hours) ?? 0;
    }

    public CalculationResult Calculate(Subject subject)
    {
        try
        {
            CalculationResult calculation = new();  
            bool isThereAnyHoliday = false;
            double initialHours = subject.Hours;
            double affectingHours = 0;

            do
            {
                calculation = GetDays(subject);
                _holidayService.Schedules = subject.Schedules;
                List<Holiday> holidays = _holidayService.GetHolidays(subject.StartDate, calculation.EndDate);
                double impactingHours = holidays.Sum(h => h.AffectingHours);
                isThereAnyHoliday = impactingHours > affectingHours;
                affectingHours += impactingHours;
                subject.Hours = initialHours + impactingHours;
                calculation.Holidays = holidays;
                calculation.ClassDays -= holidays.Count;
            } while (isThereAnyHoliday);

            return calculation;

        }
        catch (System.Exception)
        {
            throw;
        }
    }
}