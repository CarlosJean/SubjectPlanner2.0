using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SubjectPlanner.Api;
using SubjectPlanner.Core;

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
            SubjectService.CalculationResult calculation = _subjectService.GetDays(subjectDto ?? new Subject());

            return Ok(new {
                EndDate = calculation.EndDate.ToString(),
                ClassDays = calculation.ClassDays.ToString(),
            });
        }
    }
}
