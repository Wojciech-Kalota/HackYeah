using System.Security.Claims;
using System.Text.Json;
using eInicjatywa.Data;
using eInicjatywa.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using eInicjatywa.Entities;

namespace eInicjatywa.Services
{
    public interface ISessionService
    {
        public Task<InternalSessionDto> LoginAsync(ClaimsPrincipal? claimsPrincipal, LoginDto request);
        public Task LogoutAsync(ClaimsPrincipal? claimsPrincipal);
    }

    public class SessionService : ISessionService
    {
        private readonly AppDbContext _db;
        private readonly ICacheService _cacheService;
        private readonly UtilsService _utilsService;
        private readonly IPasswordHasher<User> _passwordHasher;
        public SessionService(AppDbContext db,ICacheService cacheService, UtilsService utilsService, IPasswordHasher<User> passwordHasher)
        {
            _db = db;
            _cacheService = cacheService;
            _utilsService = utilsService;
            _passwordHasher = passwordHasher;
        }
        public async Task<InternalSessionDto> LoginAsync(ClaimsPrincipal? claimsPrincipal, LoginDto request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if(user == null)
            {
                throw new Exception("Invalid creadentials");
            }

            PasswordVerificationResult passwordResult;
            try
            {
                passwordResult = _passwordHasher.VerifyHashedPassword(user, user.Password, request.Password);
            }
            catch (FormatException)
            {
                passwordResult = PasswordVerificationResult.Failed;
            }

            if (passwordResult == PasswordVerificationResult.Failed)
            {
                throw new Exception("Invalid credentials");
            }
            else if (passwordResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.Password = _passwordHasher.HashPassword(user, request.Password);
                await _db.SaveChangesAsync();
            }

            var roles = await _db.UserRoles.Where(ur=> ur.UserId == user.Id).Select(ur => ur.Role.Name).ToListAsync();

            DateTime timeNow = DateTime.UtcNow;
            InternalSessionDto sessionDto = new InternalSessionDto(Guid.CreateVersion7(), user.Id,timeNow, timeNow.AddHours(2), roles);

            var redisKey = $"eInicjatywa:Session:{sessionDto.Token}";
            await _cacheService.SetValueAtKeyAsync(redisKey, JsonSerializer.Serialize(sessionDto), timeNow.AddHours(2));

            return sessionDto;
        }

        public async Task LogoutAsync(ClaimsPrincipal? claimsPrincipal)
        {
            if(! await _utilsService.IsAuthenticated(claimsPrincipal))
            {
                throw new Exception("Not authenticated");
            }
            if(await _utilsService.GetTokenGuid(claimsPrincipal) == Guid.Empty)
            {
                throw new Exception("No token in sesssion cookie");
            }
            var sessionToken = await _utilsService.GetTokenGuid(claimsPrincipal);
            var redisKey = $"eInicjatywa:Session:{sessionToken}";
            await _cacheService.RemoveKeyAsync(redisKey);
            return;
        }
    }
}
