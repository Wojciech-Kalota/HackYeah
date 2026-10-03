using eInicjatywa.Dtos;
using eInicjatywa.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Tasks;
using System.Diagnostics.Contracts;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IdeasController : ControllerBase
    {
        private readonly IIdeasService _ideasService;

        public IdeasController(IIdeasService ideasService)
        {
            _ideasService = ideasService;
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateIdea([FromBody] IdeaDto ideaDto)
        {
            var results = await _ideasService.CreateIdeaAsync(User, ideaDto);
            return Ok(results);
        }

        [HttpGet]
        public async Task<IActionResult> GetIdeas()
        {
            var results = await _ideasService.GetIdeasAsync();
            return Ok(results);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetIdea(Guid id)
        {
            var results = await _ideasService.GetIdeaByIdAsync(id);
            return Ok(results);
        }

        [HttpPatch("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateIdea(Guid id, [FromBody] IdeaDto ideaDto)
        {
            return Ok();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteIdea(Guid id)
        {
            var results = await _ideasService.DeleteIdeaAsync(User, id);
            return results ? NoContent() : BadRequest();
        }

        [HttpPost("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> AddComment(Guid id, [FromBody] CommentDto commentDto)
        {
            return Ok();
        }

        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetComments(Guid id)
        {
            return Ok();
        }

        [HttpPut("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(Guid id, [FromBody] CommentDto commentDto)
        {
            return Ok();
        }

        [HttpDelete("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            return Ok();
        }
    }
}
