using System;
using System.Collections.Generic;
using System.Linq;
using SubjectPlanner.Core;

public class SubjectService
{
    public double GetDays(Subject subject)
    {
        //Ordenar los días de la semana
        List<Schedule>? orderedSchedules = subject?.Schedules?
            .OrderBy(s => s.Day)?
            .ToList();
        
        //Cantidad de horas por semana
        double hoursPerWeek = subject?
            .Schedules?
            .Sum(s => (s.HourTo - s.HourFrom ).Hours) ?? 0;

        List<Schedule> firstWeekWorkingDays = subject?
            .Schedules?
            .Where(s => s.Day >= subject.StartDate.DayOfWeek).ToList() ?? [];
        
        double firstWeekNonImpartedHours = hoursPerWeek - firstWeekWorkingDays.Sum(f => (f.HourTo - f.HourFrom).Hours);

        double weeks = (subject?.Hours ?? 0 + firstWeekNonImpartedHours) / hoursPerWeek;

        double days = (Math.Ceiling(weeks) - 1) * 7;

                double fractionalWeeks = weeks % 1;

        double totalHours = fractionalWeeks * hoursPerWeek;

        double finalHours = (fractionalWeeks == 0) ? hoursPerWeek : Math.Ceiling(totalHours - 1e-9);

        for (int i = 0; i < subject?.Schedules?.Count; i++) {
            Schedule schedule = subject.Schedules[i];

            long hours = (schedule.HourTo - schedule.HourFrom).Hours;

            if (finalHours <= hours) {
                break;
            }

            finalHours -= hours;
            Schedule nextSchedule = subject.Schedules[i + 1];
            days += nextSchedule.Day - schedule.Day;
        }

        return days;
    }
}