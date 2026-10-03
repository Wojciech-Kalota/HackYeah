using eInicjatywa.Dtos;
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
        [HttpPost]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> CreateDistrict([FromBody] DistrictDto districtDto)
        {
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetDistricts()
        {
            return Ok();
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
