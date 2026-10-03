using eInicjatywa.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN_USER")]
    public class CatgoriesController : ControllerBase
    {
        [HttpPost]
        [Authorize(Roles = "ADMIN_USER")]
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
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryDto categoryDto)
        {
            return Ok();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            return Ok();
        }
    }
}
