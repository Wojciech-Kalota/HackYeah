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
            return results == null ? NotFound() : Ok(results);
        }

        [HttpPatch("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateIdea(Guid id, [FromBody] IdeaDto ideaDto)
        {
            var result = await _ideasService.UpdateIdeaAsync(User, id, ideaDto);
            return result == null ? NotFound() : Ok(result);
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
            var results = await _ideasService.AddCommentAsync(User, id, commentDto);
            return Ok(results);
        }

        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetComments(Guid id)
        {
            var results = await _ideasService.GetCommentsByIdeaIdAsync(id);
            return Ok(results);
        }

        [HttpPut("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(Guid id, [FromBody] CommentDto commentDto)
        {
            var result = await _ideasService.UpdateCommentAsync(User, id, commentDto);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpDelete("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            try{
                var results = await _ideasService.DeleteCommentAsync(User, id);
                return results ? NoContent() : BadRequest();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
