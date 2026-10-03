using eInicjatywa.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.Contracts;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IdeasController : ControllerBase
    {
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateIdea([FromBody] IdeaDto ideaDto)
        {

            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetIdeas()
        {
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetIdea(Guid id)
        {
            return Ok();
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
            return Ok();
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
