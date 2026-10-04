using eInicjatywa.Dtos;
using eInicjatywa.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusesController : ControllerBase
    {
        private readonly IStatusService _statusService;
        public StatusesController(IStatusService statusService)
        {
            _statusService = statusService;
        }
        
        [Authorize(Roles = "ADMIN_USER")]
        [HttpPost]
        public async Task<IActionResult> CreateStatus([FromBody] StatusAddDto statusDto)
        {
            try
            {
                var response = await _statusService.AddStatus(User, statusDto);
                return Ok(response);       
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetStatuses()
        {
            try
            {
                var response = await _statusService.GetStatus(User);
                return Ok(response);       
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "ADMIN_USER")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus([FromRoute] Guid id, [FromBody] StatusDto statusDto)
        {
            try
            {
                var result = await _statusService.UpdateStatus(id, statusDto);
                return result == null ? NotFound() : Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "ADMIN_USER")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatus([FromRoute] Guid id)
        {
            try
            {
                await _statusService.DeleteStatus(id);
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
