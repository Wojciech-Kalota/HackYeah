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
        public Task<List<DistrictDto>> GetDistrict(ClaimsPrincipal? claimsPrincipal, bool? krakow = null);
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

        public async Task<List<DistrictDto>> GetDistrict(ClaimsPrincipal? claimsPrincipal, bool? krakow = null)
        {
            Guid[] krakowIds =
            [
                Guid.Parse("01a1040b-379b-7980-8ace-16e29988996f"),
                Guid.Parse("01a1040b-379b-70ab-b9f7-b1bb9933256d"),
                Guid.Parse("01a1040b-379b-74af-8856-08cd15e73cd6"),
                Guid.Parse("01a1040b-379b-765f-ac8f-1599f3bee59b"),
                Guid.Parse("01a1040b-379b-71b9-bb1a-7b416a1a63db"),
                Guid.Parse("01a1040b-379b-77d9-a1c1-fe6c24e2cab6"),
                Guid.Parse("01a1040b-379b-74e3-97b7-2b27c1943453"),
                Guid.Parse("01a1040b-379b-703a-86eb-a5a468730430"),
                Guid.Parse("01a1040b-379b-7b8d-a8df-cafd11e28520"),
                Guid.Parse("01a1040b-379b-7238-9eae-6d09f0d0aa6e"),
                Guid.Parse("01a1040b-379b-7cba-84a2-31f901beb208"),
                Guid.Parse("01a1040b-379b-71b8-b8af-7f5b63888fd2"),
                Guid.Parse("01a1040b-379b-767d-976d-9a397fe1cb69"),
                Guid.Parse("01a1040b-379b-7183-b626-527c930e1a66"),
                Guid.Parse("01a1040b-379b-7ebb-8353-216d598c117a"),
                Guid.Parse("01a1040b-379b-7069-a720-a4be93b9cb90"),
                Guid.Parse("01a1040b-379b-75cc-bf98-0085b05b1313"),
                Guid.Parse("01a1040b-379b-7d4a-ad15-e2cfcf63f85f")
            ];
            var query = _db.Districts.AsNoTracking().AsQueryable();
            if(krakow != null)
            {
                if(krakow == true)
                {
                    query = query.Where(d => krakowIds.Contains(d.Id));
                }
                else
                {
                    query = query.Where(d => !krakowIds.Contains(d.Id));
                }
            }

            return await query.Select(d => new DistrictDto(d.Id,d.Name)).ToListAsync();
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
