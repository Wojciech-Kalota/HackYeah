using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DistrictsController : ControllerBase
    {
        [HttpPost]
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
        public async Task<IActionResult> UpdateDistrict(Guid id, [FromBody] DistrictDto districtDto)
        {
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDistrict(Guid id)
        {
            return Ok();
        }
    }
}
