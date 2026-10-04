using System.Security.Claims;
using eInicjatywa.Data;
using eInicjatywa.Dtos;
using eInicjatywa.Entities;
using Microsoft.EntityFrameworkCore;

namespace eInicjatywa.Services
{
    public interface IDistrictService
    {
        public Task<DistrictDto> AddDistrict(ClaimsPrincipal? claimsPrincipal,DistrictAddDto categoryAddDto);
        public Task<List<DistrictDto>> GetDistrict(ClaimsPrincipal? claimsPrincipal);
        public Task<DistrictDto> UpdateDistrict(Guid id, DistrictDto dto);
        public Task DeleteDistrict(Guid id);
    }

    public class DistrictService : IDistrictService
    {
        private readonly AppDbContext _db;

        public DistrictService(AppDbContext db)
        {
            _db = db;
        }
        public async Task<DistrictDto> AddDistrict(ClaimsPrincipal? claimsPrincipal,DistrictAddDto request)
        {
            var district = await _db.Districts.FirstOrDefaultAsync(c => c.Name == request.Name);

            if(district != null)
            {
                throw new Exception("Category already exists");
            }

            district = new District
            {
                Id = Guid.CreateVersion7(),
                Name = request.Name
            };

            _db.Districts.Add(district);
            await _db.SaveChangesAsync();
            return new DistrictDto(district.Id, district.Name);
        }

        public async Task<List<DistrictDto>> GetDistrict(ClaimsPrincipal? claimsPrincipal)
        {
            return await _db.Districts.AsNoTracking().Select(d => new DistrictDto(d.Id,d.Name)).ToListAsync();
        }

        public async Task<DistrictDto> UpdateDistrict(Guid id, DistrictDto dto)
        {
            var district = await _db.Districts.FirstOrDefaultAsync(d=> d.Id == id);
            if (district == null)
            {
                throw new Exception("Noting to update");
            }
            district.Name = dto.Name;
            await _db.SaveChangesAsync();
            return new DistrictDto(district.Id, district.Name);
        }

        public async Task DeleteDistrict(Guid id)
        {
            var district = await _db.Districts.FirstOrDefaultAsync(d => d.Id == id);
            if(district == null)
            {
                throw new Exception("Nothing to delete");
            }
            _db.Districts.Remove(district);
            await _db.SaveChangesAsync();
            return;
        }
    }
}
