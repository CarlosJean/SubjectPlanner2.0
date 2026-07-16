using Microsoft.Extensions.Configuration;
using SubjectPlanner.Core;
using SubjectPlanner.Core.Exceptions;
using SubjectPlanner.Core.Helpers;
using SubjectPlanner.Core.Services;

public class SubjectServiceTests
{
    private readonly IConfigurationRoot _config;

    public SubjectServiceTests()
    {
        _config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.test.json", false, true).Build();
    }

    [Fact]
    public void Calculate_Holiday_EndDateMovedToNewDate()
    {
        //Arrange
        Subject subject = new()
        {
            Hours = 15,
            StartDate = new DateTime(2017, 01, 16),
            Schedules = [
                new Schedule {
                    Day = DayOfWeek.Monday,
                    HourFrom = new TimeOnly(08, 00),
                    HourTo = new TimeOnly(10, 00),
                }
            ]
        };

        HolidaysService holidayService = new(_config)
        {
            Schedules = subject.Schedules
        };
        SubjectService subjectService = new(holidayService);
        //End arrange

        //Act
        CalculationResult calculationResult = subjectService.Calculate(subject);
        //End act

        //Assert
        Assert.Equal(
            new DateTime(2017, 03, 20, 8, 59, 59)
                .ToString("yyyy-MM-dd HH:mm"),
            calculationResult
                .EndDate
                .ToString("yyyy-MM-dd HH:mm")
        );

        Assert.Equal(8, calculationResult.ClassDays);
        //End assert
    }

    [Fact]
    public void Calculate_ClassEndsByHolyWeek_FinishesNextweek()
    {
        //Arrange
        Subject subject = new()
        {
            Hours = 4,
            StartDate = new DateTime(2017, 04, 5),
            Schedules = [
                new Schedule {
                    Day = DayOfWeek.Wednesday,
                    HourFrom = new TimeOnly(08, 00),
                    HourTo = new TimeOnly(10, 00),
                }
            ]
        };

        HolidaysService holidayService = new(_config)
        {
            Schedules = subject.Schedules
        };
        SubjectService subjectService = new(holidayService);
        //End arrange

        //Act
        CalculationResult calculationResult = subjectService.Calculate(subject);
        //End act

        //Assert
        Assert.Equal(
            new DateTime(2017, 04, 19, 10, 0, 0)
                .ToString("yyyy-MM-dd HH:mm"),
            calculationResult
                .EndDate
                .ToString("yyyy-MM-dd HH:mm")
        );
        //End assert
    }

    [Fact]
    public void GetDays_OnlyOneClassHourTotal_ClassDaysOneAndSameStartDate()
    {
        //Arrange
        Subject subject = new()
        {
            Hours = 1,
            StartDate = new DateTime(2017, 04, 19),
            Schedules = [
                new Schedule {
                    Day = DayOfWeek.Wednesday,
                    HourFrom = new TimeOnly(08, 00),
                    HourTo = new TimeOnly(10, 00),
                }
            ]
        };

        HolidaysService holidayService = new(_config)
        {
            Schedules = subject.Schedules
        };
        SubjectService subjectService = new(holidayService);
        //End arrange

        //Act
        CalculationResult calculationResult = subjectService.Calculate(subject);
        //End act

        //Assert
        Assert.Equal(
            new DateTime(2017, 04, 19, 8, 59, 59)
                .ToString("yyyy-MM-dd HH:mm"),
            calculationResult
                .EndDate
                .ToString("yyyy-MM-dd HH:mm")
        );

        Assert.Equal(1, calculationResult.ClassDays);
        //End assert
    }

    [Fact]
    public void Calculate_LessThanCeroHours_Exception()
    {
        //Arrange
        Subject subject = new()
        {
            Hours = -1,
            StartDate = new DateTime(2017, 04, 19),
            Schedules = [
                new Schedule {
                    Day = DayOfWeek.Wednesday,
                    HourFrom = new TimeOnly(08, 00),
                    HourTo = new TimeOnly(10, 00),
                }
            ]
        };

        HolidaysService holidayService = new(_config)
        {
            Schedules = subject.Schedules
        };
        SubjectService subjectService = new(holidayService);
        //End arrange

        CalculationResult result = subjectService.Calculate(subject);

        Assert.Equal(subject.StartDate, result.EndDate);
        Assert.Equal(0, result.ClassDays);
        Assert.Equal([], result.Holidays);
    }

    [Fact]
    public void Calculate_CeroHoursSchedule_ThrowsWrongScheduleException()
    {
        //Arrange
        Subject subject = new()
        {
            Hours = 1,
            StartDate = new DateTime(2017, 04, 19),
            Schedules = [
                new Schedule {
                    Day = DayOfWeek.Wednesday,
                    HourFrom = new TimeOnly(08, 00),
                    HourTo = new TimeOnly(07, 00),
                }
            ]
        };

        HolidaysService holidayService = new(_config)
        {
            Schedules = subject.Schedules
        };
        SubjectService subjectService = new(holidayService);
        //End arrange

        var exception = Assert.Throws<WrongScheduleException>(() => subjectService.Calculate(subject));        
    }
}