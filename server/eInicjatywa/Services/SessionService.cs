using System.Security.Claims;
using System.Text.Json;
using eInicjatywa.Data;
using eInicjatywa.Dtos;
using Microsoft.EntityFrameworkCore;

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
        public SessionService(AppDbContext db,ICacheService cacheService, UtilsService utilsService)
        {
            _db = db;
            _cacheService = cacheService;
            _utilsService = utilsService;
        }
        public async Task<InternalSessionDto> LoginAsync(ClaimsPrincipal? claimsPrincipal, LoginDto request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);

            if(user == null)
            {
                throw new Exception("Invalid creadentials");
            }

            DateTime timeNow = DateTime.UtcNow;
            InternalSessionDto sessionDto = new InternalSessionDto(Guid.CreateVersion7(), user.Id,timeNow, timeNow.AddHours(2));

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
            var redisKey = $"eInicjatywa:Session:{_utilsService.GetTokenGuid(claimsPrincipal)}";
            await _cacheService.RemoveKeyAsync(redisKey);
            return;
        }
    }
}