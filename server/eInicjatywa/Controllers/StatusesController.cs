using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusesController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateStatus([FromBody] StatusDto statusDto)
        {
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetStatuses()
        {
            return Ok();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] StatusDto statusDto)
        {
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatus(Guid id)
        {
            return Ok();
        }
    }
}
