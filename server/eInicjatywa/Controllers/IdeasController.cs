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
            try
            {
                var results = await _ideasService.CreateIdeaAsync(User, ideaDto);
                return Ok(results);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}")]
        [Authorize]
        public async Task<IActionResult> AddImage([FromRoute] Guid id, [FromForm] IFormFile file)
        {
            try
            {
                var results = await _ideasService.AddImageAsync(User, id, file);
                return Ok(results);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetIdeas([FromQuery] IdeaFilterDto? filter = null, [FromQuery] bool? originals = null)
        {
            try
            {
                var results = await _ideasService.GetIdeasAsync(User, filter, originals);
                return Ok(results);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetIdea([FromRoute] Guid id)
        {
            try
            {
                var results = await _ideasService.GetIdeaByIdAsync(id);
                return Ok(results);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateIdea([FromRoute] Guid id, [FromBody] IdeaDto ideaDto)
        {
            try
            {
                var result = await _ideasService.UpdateIdeaAsync(User, id, ideaDto);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteIdea([FromRoute] Guid id)
        {
            try
            {
                await _ideasService.DeleteIdeaAsync(User, id);
                return Ok();   
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);   
            }
        }

        [HttpPost("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> AddComment([FromRoute] Guid id, [FromBody] CommentDto commentDto)
        {
            try
            {
                var results = await _ideasService.AddCommentAsync(User, id, commentDto);
                return Ok(results);    
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }

        [HttpGet("{id}/comments")]
        [AllowAnonymous]
        public async Task<IActionResult> GetComments([FromRoute] Guid id)
        {
            try
            {
                var results = await _ideasService.GetCommentsByIdeaIdAsync(id);
                return Ok(results);    
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }

        [HttpPut("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> UpdateComment([FromRoute] Guid id, [FromBody] CommentDto commentDto)
        {
            try
            {
                var result = await _ideasService.UpdateCommentAsync(User, id, commentDto);
                return Ok(result);   
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> DeleteComment([FromRoute] Guid id)
        {
            try
            {
                await _ideasService.DeleteCommentAsync(User, id);
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/change-vote")]
        [Authorize]
        public async Task<IActionResult> ChangeIdeaVote([FromRoute] Guid id)
        {
            try
            {
                var result = await _ideasService.ChangeIdeaVoteAsync(User, id);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
