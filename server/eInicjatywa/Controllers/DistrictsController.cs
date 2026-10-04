using eInicjatywa.Dtos;
using eInicjatywa.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
        [AllowAnonymous]
        public async Task<IActionResult> GetDistricts([FromQuery] bool? krakow = null)
        {
            try
            {
                var response = await _districtService.GetDistrict(User, krakow);
                return Ok(response);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> UpdateDistrict([FromRoute] Guid id, [FromBody] DistrictDto districtDto)
        {
            try
            {
                var result = await _districtService.UpdateDistrict(id, districtDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> DeleteDistrict(Guid id)
        {
            try
            {
                await _districtService.DeleteDistrict(id);
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
