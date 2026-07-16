namespace SubjectPlanner.Api;

public class ScheduleDto
{
    public DayOfWeek Day { get; set; }
    public TimeOnly HourFrom { get; set; }
    public TimeOnly HourTo { get; set; }
}