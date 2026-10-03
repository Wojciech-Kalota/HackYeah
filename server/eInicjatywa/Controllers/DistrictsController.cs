using eInicjatywa.Dtos;
using eInicjatywa.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN_USER")]
    public class DistrictsController : ControllerBase
    {
        private readonly IDistrictService _districtService;

        public DistrictsController(IDistrictService districtService)
        {
            _districtService = districtService;
        }
        [HttpPost]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> CreateDistrict([FromBody] DistrictAddDto districtDto)
        {
            try
            {
                var response = await _districtService.AddDistrict(User, districtDto);
                return Ok(response);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetDistricts()
        {
            try
            {
                var response = await _districtService.GetDistrict(User);
                return Ok(response);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> UpdateDistrict(Guid id, [FromBody] DistrictDto districtDto)
        {
            return Ok();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> DeleteDistrict(Guid id)
        {
            return Ok();
        }
    }
}
