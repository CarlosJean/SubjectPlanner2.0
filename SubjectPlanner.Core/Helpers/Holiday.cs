namespace SubjectPlanner.Core.Helpers;

public class Holiday {
    public DateOnly Date { get; set; }
    public double AffectingHours { get; set; }
    public bool IsReligious { get; set; } = false;
}