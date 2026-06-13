using SubjectPlanner.Core;

public class SubjectService
{
    public CalculationResult GetDays(Subject subject)
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

    private DateTime GetEndDate(double days, double fractionalWeeks, double hoursPerWeek, Subject subject, Schedule finalSchedule)
    {
        double hoursOnLastWeek = fractionalWeeks * hoursPerWeek % 1;
        double passedHours = subject?.Schedules?.Where(s => s.Day < finalSchedule.Day).Sum(s => (s.HourTo - s.HourFrom).TotalHours) ?? 0;

        double finalDayTime = hoursOnLastWeek - passedHours;

        TimeOnly endDateMinutes = finalSchedule.HourFrom.AddMinutes(finalDayTime * 60);

        DateOnly date = DateOnly.FromDateTime(subject?.StartDate.AddDays(days) ?? new DateTime(0001, 01, 01));

        DateTime endDate = new(date, endDateMinutes);

        return endDate;
    }

    public class CalculationResult
    {
        public DateTime EndDate { get; set; }
        public int ClassDays { get; set; }
    }
}
