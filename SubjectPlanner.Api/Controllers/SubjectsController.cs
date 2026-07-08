using Microsoft.AspNetCore.Mvc;
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

        public SubjectsController(SubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        [HttpPost]
        public IActionResult GetEndDate(Subject subjectDto)
        {
            try {
                if (subjectDto.Hours < 0) return BadRequest(new CalculationResult{ ClassDays = 0, EndDate = subjectDto.StartDate, Holidays = []});

                CalculationResult calculation = _subjectService.Calculate(subjectDto ?? new Subject());

                return Ok(new {
                    Ok = true,
                    EndDate = calculation.EndDate.ToString(),
                    ClassDays = calculation.ClassDays.ToString(),
                    calculation.Holidays,
                });
            } catch (System.Exception ex) {
                return BadRequest(new {
                    Ok = false,
                    ex.Message
                });
            }
        }
    }
}
