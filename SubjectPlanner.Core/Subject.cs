using System;
using System.Collections.Generic;

namespace SubjectPlanner.Core;

public class Subject
{
    public double Hours { get; set; }
    public DateTime StartDate { get; set; }
    public List<Schedule>? Schedules { get; set; }
}