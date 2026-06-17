using Microsoft.AspNetCore.Mvc;
using SubjectPlanner.Core;
using SubjectPlanner.Core.Services;

namespace MyApp.Namespace
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
            SubjectService.CalculationResult calculation = _subjectService.Calculate(subjectDto ?? new Subject());

            return Ok(new {
                EndDate = calculation.EndDate.ToString(),
                ClassDays = calculation.ClassDays.ToString(),
                calculation.Holidays,
            });
        }
    }
}
