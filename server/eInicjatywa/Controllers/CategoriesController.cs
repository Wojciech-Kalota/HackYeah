using eInicjatywa.Dtos;
using eInicjatywa.Entities;
using eInicjatywa.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }
        [HttpPost]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryAddDto request)
        {
            try
            {
                var result = await _categoryService.AddCategory(User, request);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var result = await _categoryService.GetCategorys(User);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryDto categoryDto)
        {
            try
            {
                var result = await _categoryService.UpdateCategory(id, categoryDto);
                return result == null ? NotFound() : Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN_USER")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            return await _categoryService.DeleteCategory(id) ? NoContent() : NotFound();
        }
    }
}
