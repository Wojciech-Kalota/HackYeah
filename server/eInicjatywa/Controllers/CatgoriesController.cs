using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CatgoriesController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryDto categoryDto)
        {
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            return Ok();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryDto categoryDto)
        {
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            return Ok();
        }
    }
}
