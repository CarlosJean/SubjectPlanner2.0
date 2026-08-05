using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using SubjectPlanner.Core;
using SubjectPlanner.Core.Helpers;
using SubjectPlanner.Core.Services;

namespace SubjectPlanner.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectsController : ControllerBase
    {
        private readonly SubjectService _subjectService;
        private readonly ILogger<SubjectsController> _logger;

        public SubjectsController(SubjectService subjectService, ILogger<SubjectsController> logger)
        {
            _subjectService = subjectService;
            _logger = logger;
        }

        [HttpPost]
        public IActionResult GetEndDate(Subject subjectDto)
        {
            try {
                string requestJson = JsonSerializer.Serialize(subjectDto);
                _logger.LogInformation(requestJson);

                if (subjectDto.Hours < 0) return BadRequest(new CalculationResult{ ClassDays = 0, EndDate = subjectDto.StartDate, Holidays = []});

                CalculationResult calculation = _subjectService.Calculate(subjectDto ?? new Subject());

                string calculationString = JsonSerializer.Serialize(calculation);
                _logger.LogInformation(message: calculationString);

                return Ok(new {
                    Ok = true,
                    EndDate = calculation.EndDate.ToString(),
                    ClassDays = calculation.ClassDays.ToString(),
                    calculation.Holidays,
                });
            } catch (System.Exception) {
                return BadRequest(new {
                    Ok = false,
                    Message = "Ocurrió un error al intentar realizar la operación."
                });
            }
        }
    }
}
