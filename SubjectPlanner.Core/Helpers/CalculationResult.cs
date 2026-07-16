namespace SubjectPlanner.Core.Helpers;

public class CalculationResult
{
    public DateTime EndDate { get; set; }
    public int ClassDays { get; set; }
    public List<Holiday> Holidays { get; set; } = [];
}