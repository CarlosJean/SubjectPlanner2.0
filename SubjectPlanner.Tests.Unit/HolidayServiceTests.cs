using Microsoft.Extensions.Configuration;
using SubjectPlanner.Core;
using SubjectPlanner.Core.Helpers;
using SubjectPlanner.Core.Services;

public class HolidayServiceTests
{
    private readonly IConfigurationRoot _config;

    public HolidayServiceTests()
    {
        _config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.test.json", false, true).Build();
    }

    [Fact(DisplayName = "Cuando hay un día feriado pero dicho día fue movido día posterior, ese día no debería ser considerado porque no impactó a la materia")]
    public void GetHolidays_HolidayMovedToNextDate_NoHolidays()
    {        
        //Arrange
        DateTime subjectStartDate = new(2017, 01, 16);
        DateTime subjectEndDate = new(2017, 01, 27);
        List<Schedule> schedules = [
            new() {
                Day = DayOfWeek.Monday,
                HourFrom = new TimeOnly(08, 00),
                HourTo = new TimeOnly(10, 00),
            }
        ];
        //End arrange        
        
        HolidaysService holidaysService = new(_config)
        {
            Schedules = schedules
        };
        List<SubjectPlanner.Core.Helpers.Holiday> holidays =  holidaysService.GetHolidays(subjectStartDate, subjectEndDate);

        Assert.Empty(holidays);
    }
    
    [Fact(DisplayName = "Cuando hay un día feriado pero dicho día fue movido día posterior, ese día no debería ser considerado porque no impactó a la materia")]
    public void GetHolidays_SubjectImpactedByHoliday_ListOfHolidays()
    {        
        //Arrange
        DateTime subjectStartDate = new(2017, 01, 16);
        DateTime subjectEndDate = new(2017, 01, 30);
        List<Schedule> schedules = [
            new() {
                Day = DayOfWeek.Monday,
                HourFrom = new TimeOnly(08, 00),
                HourTo = new TimeOnly(10, 00),
            }
        ];
        //End arrange        

        HolidaysService holidaysService = new(_config)
        {
            Schedules = schedules
        };
        List<SubjectPlanner.Core.Helpers.Holiday> holidays = holidaysService.GetHolidays(subjectStartDate, subjectEndDate);

        Assert.NotEmpty(holidays);
    }
    
}