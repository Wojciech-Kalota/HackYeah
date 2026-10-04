using eInicjatywa.Dtos;
using eInicjatywa.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace eInicjatywa.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterUser(RegisterDto request)
        {
            try
            {
                var response = await _userService.RegisterAsync(User, request);
                return Ok(response);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                var response = await _userService.MeAsync(User);
                return Ok(response);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}