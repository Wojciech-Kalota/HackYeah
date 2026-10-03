using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UtilsController : ControllerBase
    {

        [HttpGet("health")]
        public async Task<IActionResult> Get()
        {
            return Ok("healthy");
        }
    }
}
