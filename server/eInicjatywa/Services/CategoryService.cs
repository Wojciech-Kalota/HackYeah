using System.Security.Claims;
using eInicjatywa.Data;
using eInicjatywa.Dtos;
using eInicjatywa.Entities;
using Microsoft.EntityFrameworkCore;

namespace eInicjatywa.Services
{
    public interface ICategoryService
    {
        public Task<CategoryDto> AddCategory(ClaimsPrincipal? claimsPrincipal,CategoryAddDto categoryAddDto);
        public Task<List<CategoryDto>> GetCategorys(ClaimsPrincipal? claimsPrincipal);
        public Task<CategoryDto> UpdateCategory(Guid id, CategoryDto dto);
        public Task DeleteCategory(Guid id);
    }

    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _db;

        public CategoryService(AppDbContext db)
        {
            _db = db;
        }
        public async Task<CategoryDto> AddCategory(ClaimsPrincipal? claimsPrincipal,CategoryAddDto categoryAddDto)
        {
            var category = await _db.Categories.FirstOrDefaultAsync(c => c.Name == categoryAddDto.Name);

            if(category != null)
            {
                throw new Exception("Category already exists");
            }

            category = new Category
            {
                Id = Guid.CreateVersion7(),
                Name = categoryAddDto.Name
            };

            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return new CategoryDto(category.Id, category.Name);
        }

        public async Task<List<CategoryDto>> GetCategorys(ClaimsPrincipal? claimsPrincipal)
        {
            return await _db.Categories.AsNoTracking().Select(c => new CategoryDto(c.Id,c.Name)).ToListAsync();
        }

        public async Task<CategoryDto> UpdateCategory(Guid id, CategoryDto dto)
        {
            var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
            if(category == null)
            {
                throw new Exception("There is no category");
            }
            category.Name = dto.Name;
            await _db.SaveChangesAsync();
            return new CategoryDto(category.Id, category.Name);
        }

        public async Task DeleteCategory(Guid id)
        {
            var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id==id);
            if (category == null)
            {
                throw new Exception("the is nothing to delete");
            } 
            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();
            return;
        }
    }
}
