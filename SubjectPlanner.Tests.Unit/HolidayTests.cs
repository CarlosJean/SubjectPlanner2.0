using Microsoft.Extensions.Configuration;
using SubjectPlanner.Core;
using SubjectPlanner.Core.Services;

public class HolidayServiceTests
{
    [Fact]
    public void GetHolidays()
    {        
        //Arrange
        DateTime subjectStartDate = new(2017, 01, 16);
        DateTime subjectEndDate = new(2017, 02, 15);
        List<Schedule> schedules = [
            new() {
                Day = DayOfWeek.Monday,
                HourFrom = new TimeOnly(08, 00),
                HourTo = new TimeOnly(10, 00),
            }
        ];
        //End arrange

        IConfiguration config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.test.json", false, true).Build();
        
        HolidaysService holidaysService = new(config, schedules);
        List<Holiday> holidays =  holidaysService.GetHolidays(subjectStartDate, subjectEndDate);
    }
    
}