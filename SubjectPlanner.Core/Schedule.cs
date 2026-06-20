namespace SubjectPlanner.Core;

public class Schedule {
    public DayOfWeek Day { get; set; }
    public TimeOnly HourFrom { get; set; }
    public TimeOnly HourTo { get; set; }    
}