using eInicjatywa.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusesController : ControllerBase
    {
        [Authorize(Roles = "ADMIN_USER")]
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

        [Authorize(Roles = "ADMIN_USER")]
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] StatusDto statusDto)
        {
            return Ok();
        }

        [Authorize(Roles = "ADMIN_USER")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatus(Guid id)
        {
            return Ok();
        }
    }
}
