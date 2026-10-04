using System.Security.Claims;
using eInicjatywa.Data;
using eInicjatywa.Dtos;
using eInicjatywa.Entities;
using Microsoft.EntityFrameworkCore;

namespace eInicjatywa.Services
{
    public interface IStatusService
    {
        public Task<StatusDto> AddStatus(ClaimsPrincipal? claimsPrincipal,StatusAddDto dto);
        public Task<List<StatusDto>> GetStatus(ClaimsPrincipal? claimsPrincipal);
        public Task<StatusDto> UpdateStatus(Guid id, StatusDto dto);
        public Task DeleteStatus(Guid id);
    }

    public class StatusService : IStatusService
    {
        private readonly AppDbContext _db;

        public StatusService(AppDbContext db)
        {
            _db = db;
        }
        public async Task<StatusDto> AddStatus(ClaimsPrincipal? claimsPrincipal,StatusAddDto dto)
        {
            var status = await _db.Statuses.FirstOrDefaultAsync(c => c.Name == dto.Name);

            if(status != null)
            {
                throw new Exception("Category already exists");
            }

            status = new Status
            {
                Id = Guid.CreateVersion7(),
                Name = dto.Name
            };

            _db.Statuses.Add(status);
            await _db.SaveChangesAsync();
            return new StatusDto(status.Id, status.Name);
        }

        public async Task<List<StatusDto>> GetStatus(ClaimsPrincipal? claimsPrincipal)
        {
            return await _db.Statuses.AsNoTracking().Select(s => new StatusDto(s.Id,s.Name)).ToListAsync();
        }

        public async Task<StatusDto> UpdateStatus(Guid id, StatusDto dto)
        {
            var status = await _db.Statuses.FirstOrDefaultAsync(s=> s.Id==id);
            if (status == null)
            {
                throw new Exception("Nothing to update");
            }
            status.Name = dto.Name;
            await _db.SaveChangesAsync();
            return new StatusDto(status.Id, status.Name);
        }

        public async Task DeleteStatus(Guid id)
        {
            var status = await _db.Statuses.FindAsync(id);
            if (status == null)
            {
                throw new Exception("Nothing to delete");
            }
            _db.Statuses.Remove(status);
            await _db.SaveChangesAsync();
            return;
        }
    }
}
