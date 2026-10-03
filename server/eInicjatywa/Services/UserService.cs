using System.Security.Claims;
using eInicjatywa.Data;
using eInicjatywa.Dtos;
using eInicjatywa.Entities;
using Microsoft.EntityFrameworkCore;

namespace eInicjatywa.Services
{
    public interface IUserService
    {
        public Task<UserDto> RegisterAsync(ClaimsPrincipal? claimsPrincipal, RegisterDto request);
        public Task<UserDto> MeAsync(ClaimsPrincipal? claimsPrincipal);
    }

    public class UserService : IUserService
    {
        private readonly AppDbContext _db;
        private readonly UtilsService _utilsService;
        public UserService(AppDbContext db, UtilsService utilsService)
        {
            _db = db;
            _utilsService = utilsService;
        }

        public async Task<UserDto> RegisterAsync(ClaimsPrincipal? claimsPrincipal, RegisterDto request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if(user != null)
            {
                throw new Exception("Useralready exists");
            }

            user = new User
            {
                Id = Guid.CreateVersion7(),
                Email = request.Email,
                Password = request.Password,
                Name = request.NameFirst,
                Surname = request.NameLast,
                DistrictId = null
            };
            
            var roles = await _db.Roles.ToListAsync();

            var validTeamRoleNames = roles
                .Select(r => r.Name)
                .ToHashSet(StringComparer.Ordinal);

            foreach (var role in request.Roles)
            {
                if (!validTeamRoleNames.Contains(role) || string.IsNullOrEmpty(role))
                {
                    throw new Exception("Specified role is not valid");
                }
            }

            List<UserRole> userRoles = new List<UserRole>();

            foreach (var role in request.Roles)
            {
                userRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = roles.FirstOrDefault(r => r.Name == role)!.Id
                });
            }

            await _db.UserRoles.AddRangeAsync(userRoles);
            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            return new UserDto(user.Id,user.Email,user.Name,user.Surname,request.Roles);
        }

        public async Task<UserDto> MeAsync(ClaimsPrincipal? claimsPrincipal)
        {
            if(!await _utilsService.IsAuthenticated(claimsPrincipal))
            {
                throw new Exception("Not authenticated");
            }
            if(await _utilsService.GetUserId(claimsPrincipal) == Guid.Empty)
            {
                throw new Exception("No user id in cookie");
            }

            var userId = await _utilsService.GetUserId(claimsPrincipal);
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if(user == null)
            {
                throw new Exception("User Does not exist");
            }

            var roles = await _db.UserRoles.Where(ur => ur.UserId == user.Id).Select(ur=> ur.Role.Name).ToListAsync();

            return new UserDto(user.Id, user.Email, user.Name, user.Surname, roles);
        }
    }
}