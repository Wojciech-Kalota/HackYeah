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
    public class SessionController : ControllerBase
    {
        private readonly ISessionService _sessionService;
        public SessionController(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            try
            {
                var response = await _sessionService.LoginAsync(User, request);
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, response.UserId.ToString()),
                    new Claim("SessionToken", response.Token.ToString())
                };
                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true, 
                    ExpiresUtc = response.ExpiresAt
                };
                var identity = new ClaimsIdentity(claims, "SessionCookie");
                await HttpContext.SignInAsync(
                    "SessionCookie", 
                    new ClaimsPrincipal(identity), 
                    authProperties
                );
                return Ok(new SessionDto(response.UserId, response.CreatedAt, response.ExpiresAt));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                await _sessionService.LogoutAsync(User);
                await HttpContext.SignOutAsync("SessionCookie");
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
