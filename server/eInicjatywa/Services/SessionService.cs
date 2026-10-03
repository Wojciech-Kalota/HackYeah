using System.Security.Claims;
using eInicjatywa.Dtos;

namespace eInicjatywa.Services
{
    public interface ISessionService
    {
        public Task<InternalSessionDto> LoginAsync(ClaimsPrincipal? claimsPrincipal, LoginDto request);
        public Task LogoutAsync(ClaimsPrincipal? claimsPrincipal);
    }

    public class SessionService : ISessionService
    {
        private readonly ICacheService _cacheService;
        private readonly UtilsService _utilsService;
        public SessionService(ICacheService cacheService, UtilsService utilsService)
        {
            _cacheService = cacheService;
            _utilsService = utilsService;
        }
        public async Task<InternalSessionDto> LoginAsync(ClaimsPrincipal? claimsPrincipal, LoginDto request)
        {
            // db strike check if email and password is correct
            DateTime timeNow = DateTime.UtcNow;
            return new InternalSessionDto(Guid.CreateVersion7(), Guid.CreateVersion7(), timeNow, timeNow.AddHours(2));
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