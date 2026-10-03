using System.Linq.Expressions;
using System.Security.Claims;
using eInicjatywa.Dtos;

namespace eInicjatywa.Services
{
    public interface IUtilsService
    {
        Task<Guid> GetTokenGuid(ClaimsPrincipal? claimsPrincipal);
        Task<Guid> GetUserId(ClaimsPrincipal? claimsPrincipal);
        Task<bool> IsAuthenticated(ClaimsPrincipal? claimsPrincipal);
    }

    public class UtilsService : IUtilsService
    {
        public async Task<Guid> GetTokenGuid(ClaimsPrincipal? claimsPrincipal)
        {
            if(claimsPrincipal == null)
            {
                return Guid.Empty;
            }
            if(claimsPrincipal.FindFirstValue("SessionToken") == null)
            {
                return Guid.Empty;
            }
            return Guid.TryParse(claimsPrincipal.FindFirstValue("SessionToken")!, out var guid) ? guid : Guid.Empty;
        }

        public async Task<Guid> GetUserId(ClaimsPrincipal? claimsPrincipal)
        {
            if(claimsPrincipal == null)
            {
                return Guid.Empty;
            }
            if(claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) == null)
            {
                return Guid.Empty;
            }
            return Guid.TryParse(claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier)!, out var guid) ? guid : Guid.Empty;
        }

        public async Task<bool> IsAuthenticated(ClaimsPrincipal? claimsPrincipal)
        {
            if(claimsPrincipal == null)
            {
                return false;
            }
            if(claimsPrincipal.Identity == null)
            {
                return false;
            }
            if(!claimsPrincipal.Identity.IsAuthenticated)
            {
                return false;
            }
            return true;
        }

    }
}