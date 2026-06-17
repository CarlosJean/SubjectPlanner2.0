namespace SubjectPlanner.Core.Services;
public class SubjectService
{
    private readonly HolidaysService _holidayService;

    public SubjectService(HolidaysService holidaysService) {
        _holidayService = holidaysService;
    }
    private CalculationResult GetDays(Subject subject)
    {
        //Ordenar los días de la semana
        subject.Schedules = subject?.Schedules?
            .OrderBy(s => s.Day)?
            .ToList();

        //Cantidad de horas por semana
        double hoursPerWeek = subject?
            .Schedules?
            .Sum(s => (s.HourTo - s.HourFrom).Hours) ?? 0;

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

        for (int i = 0; i < subject?.Schedules?.Count; i++)
        {
            Schedule schedule = subject.Schedules[i];

            long hours = (schedule.HourTo - schedule.HourFrom).Hours;

            if (finalHours <= hours) {

                double l = (subject?.Hours ?? 0)  / hoursPerWeek;
                double m = l % 1;

                int classDays = ( (int)l * subject.Schedules.Count ) + (int)Math.Ceiling(m * subject.Schedules.Count);

                double passedHours = subject?.Schedules?.Where(s => s.Day < schedule.Day).Sum(s => (s.HourTo - s.HourFrom).TotalHours) ?? 0;

                Schedule firstSchedule = subject?.Schedules.FirstOrDefault() ?? new Schedule();

                DateTime actualStartDate = subject.StartDate.AddDays(firstSchedule.Day - subject.StartDate.DayOfWeek);       
                Schedule actualStartDateSchedule = subject?.Schedules?.FirstOrDefault(s => s.Day == actualStartDate.DayOfWeek) ?? new Schedule();

                DateTime endDate = new(
                    DateOnly.FromDateTime(actualStartDate.AddDays(days)),
                    actualStartDateSchedule
                        .HourFrom
                        .AddMinutes( (mins - passedHours) * 60 )
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
            EndDate = subject?.StartDate ?? new DateTime(0001, 01, 01)
        };
    }

    public CalculationResult Calculate(Subject subject)
    {
        CalculationResult calculation = new();
        bool isThereHolidays = false;
        double initialHours = subject.Hours;
        double affectingHours = 0;

        do {
            calculation = GetDays(subject);
            _holidayService.Schedules = subject.Schedules;
            List<Holiday> holidays = _holidayService.GetHolidays(subject.StartDate, calculation.EndDate);
            double impactingHours = holidays.Sum(h => h.AffectingHours);
            isThereHolidays =  impactingHours > affectingHours;
            affectingHours += impactingHours;
            subject.Hours = initialHours + impactingHours;
            calculation.Holidays = holidays;
            calculation.ClassDays -= holidays.Count;
        } while (isThereHolidays);

        return calculation;
    }

    public class CalculationResult
    {
        public DateTime EndDate { get; set; }
        public int ClassDays { get; set; }
        public List<Holiday> Holidays { get; set; } = [];
    }
}
