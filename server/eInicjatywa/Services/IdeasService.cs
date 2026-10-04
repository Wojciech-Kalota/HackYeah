using eInicjatywa.Data;
using eInicjatywa.Dtos;
using eInicjatywa.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace eInicjatywa.Services
{
    public interface IIdeasService
    {
        Task<IdeaDto> CreateIdeaAsync(ClaimsPrincipal? user, IdeaDto ideaDto);
        Task<PagedResult<IdeaDto>> GetIdeasAsync(ClaimsPrincipal? user, IdeaFilterDto? filter = null);
        Task<IdeaDto> GetIdeaByIdAsync(Guid id);
        Task<IdeaDto> UpdateIdeaAsync(ClaimsPrincipal? user,Guid id, IdeaDto ideaDto);
        Task DeleteIdeaAsync(ClaimsPrincipal? user, Guid id);

        Task<CommentDto> AddCommentAsync(ClaimsPrincipal? user, Guid ideaId, CommentDto commentDto);
        Task<IEnumerable<CommentDto>> GetCommentsByIdeaIdAsync(Guid ideaId);
        Task<CommentDto?> UpdateCommentAsync(ClaimsPrincipal? user, Guid commentId, CommentDto commentDto);
        Task DeleteCommentAsync(ClaimsPrincipal? user, Guid commentId);
    }

    public class IdeasService : IIdeasService
    {
        private readonly AppDbContext _context;
        private readonly UtilsService _utilsService;

        public IdeasService(AppDbContext context, UtilsService utilsService)
        {
            _context = context;
            _utilsService = utilsService;
        }

        public async Task<IdeaDto> CreateIdeaAsync(ClaimsPrincipal? user, IdeaDto ideaDto)
        {
            Guid userId = await _utilsService.GetUserId(user);
            if (userId == Guid.Empty)
                throw new Exception("Not authenticated");

            var categoryIds = ideaDto.CategoryIds;

            if (!await _context.Districts.AnyAsync(d => d.Id == ideaDto.DistrictId))
                throw new Exception("District does not exist");
            if (!await _context.Statuses.AnyAsync(s => s.Id == ideaDto.StatusId))
                throw new Exception("Status does not exist");

            var existingCategoryIds = await _context.Categories
                .Where(category => categoryIds.Contains(category.Id))
                .Select(category => category.Id)
                .ToListAsync();
            if (existingCategoryIds.Count != categoryIds.Count)
                throw new Exception("One or more categories do not exist");

            var idea = new Idea
            {
                Title = ideaDto.Title,
                Description = ideaDto.Description,
                ImageUrl = ideaDto.ImageUrl,
                DistrictId = ideaDto.DistrictId,
                StatusId = ideaDto.StatusId,
                AuthorId = userId
            };

            idea.IdeaCategorys = categoryIds
                .Select(categoryId => new IdeaCategory { Idea = idea, CategoryId = categoryId })
                .ToList();

            _context.Ideas.Add(idea);
            await _context.SaveChangesAsync();
            return new IdeaDto
            (
                idea.Title,
                idea.Description,
                idea.ImageUrl,
                idea.DistrictId,
                idea.StatusId,
                idea.AuthorId,
                idea.IdeaCategorys.Select(ic => ic.Categorie.Id).ToList(),
                idea.CreatedAt,
                idea.LastUpdatedAt,
                idea.Id
            );
        }

        private const int MaxPageSize = 100;

        public async Task<PagedResult<IdeaDto>> GetIdeasAsync(ClaimsPrincipal? user, IdeaFilterDto? filter = null)
        {
            var page = Math.Max(filter?.Page ?? 1, 1);
            var pageSize = Math.Clamp(filter?.PageSize ?? 20, 1, MaxPageSize);

            Guid userId = await _utilsService.GetUserId(user);

            // ideas match if they have ANY of the selected categories
            var query = _context.Ideas.AsNoTracking().AsQueryable();

            if (filter?.AuthoredByMe == true)
                query = query.Where(i => i.AuthorId == userId);

            if (filter?.StatusIds is { Count: > 0 })
                query = query.Where(i => filter.StatusIds.Contains(i.StatusId));

            if (filter?.DistrictIds is { Count: > 0 })
                query = query.Where(i => filter.DistrictIds.Contains(i.DistrictId));

            if (filter?.CategoryIds is { Count: > 0 })
            {

                query = query.Where(i => i.IdeaCategorys
                    .Any(ic => filter.CategoryIds.Contains(ic.CategoryId)));
            }

            if (!string.IsNullOrWhiteSpace(filter?.Name))
            {
                var name = filter.Name.Trim();
                query = query.Where(i => i.Title.Contains(name) || i.Description.Contains(name));
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .OrderByDescending(i => i.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new IdeaDto(
                    i.Title,
                    i.Description,
                    i.ImageUrl,
                    i.DistrictId,
                    i.StatusId,
                    i.AuthorId,
                    i.IdeaCategorys.Select(ic => ic.CategoryId).ToList(),
                    i.CreatedAt,
                    i.LastUpdatedAt,
                    i.Id
                ))
                .ToListAsync();

            return new PagedResult<IdeaDto>(
                items,
                page,
                pageSize,
                items.Count,
                totalCount,
                totalPages
            );
        }

        public async Task<IdeaDto> GetIdeaByIdAsync(Guid id)
        {
            var idea = await _context.Ideas
                .AsNoTracking()
                .Include(existingIdea => existingIdea.IdeaCategorys)
                .FirstOrDefaultAsync(existingIdea => existingIdea.Id == id);
            if(idea == null)
            {
                throw new Exception("Idea does not exist");
            }
            return new IdeaDto
            (
                idea.Title,
                idea.Description,
                idea.ImageUrl,
                idea.DistrictId,
                idea.StatusId,
                idea.AuthorId,
                idea.IdeaCategorys.Select(ic => ic.Categorie.Id).ToList(),
                idea.CreatedAt,
                idea.LastUpdatedAt,
                idea.Id
            );
        }

        public async Task<IdeaDto> UpdateIdeaAsync(ClaimsPrincipal? user, Guid id, IdeaDto ideaDto)
        {
            Guid userId = await _utilsService.GetUserId(user);
            var idea = await _context.Ideas
                .Include(existingIdea => existingIdea.IdeaCategorys)
                .FirstOrDefaultAsync(existingIdea => existingIdea.Id == id);
            if (idea == null)
            {
                throw new Exception("Nothing to update");
            }
            ;
            if (idea.AuthorId != userId && !await _utilsService.HasAdminRole(user))
                throw new Exception("You cannot update this idea");

            var categoryIds = ideaDto.CategoryIds;
            if (!await _context.Districts.AnyAsync(d => d.Id == ideaDto.DistrictId))
                throw new Exception("District does not exist");
            if (!await _context.Statuses.AnyAsync(s => s.Id == ideaDto.StatusId))
                throw new Exception("Status does not exist");
            if (await _context.Categories.CountAsync(c => categoryIds.Contains(c.Id)) != categoryIds.Count)
                throw new Exception("One or more categories do not exist");

            idea.Title = ideaDto.Title;
            idea.Description = ideaDto.Description;
            idea.ImageUrl = ideaDto.ImageUrl;
            idea.DistrictId = ideaDto.DistrictId;
            idea.StatusId = ideaDto.StatusId;
            idea.LastUpdatedAt = DateTime.UtcNow;

            _context.IdeaCategories.RemoveRange(idea.IdeaCategorys);
            idea.IdeaCategorys = categoryIds
                .Select(categoryId => new IdeaCategory { Idea = idea, CategoryId = categoryId })
                .ToList();

            await _context.SaveChangesAsync();
            return new IdeaDto
            (
                idea.Title,
                idea.Description,
                idea.ImageUrl,
                idea.DistrictId,
                idea.StatusId,
                idea.AuthorId,
                idea.IdeaCategorys.Select(ic => ic.Categorie.Id).ToList(),
                idea.CreatedAt,
                idea.LastUpdatedAt,
                idea.Id
            );
        }

        public async Task DeleteIdeaAsync(ClaimsPrincipal? user, Guid id)
        {
            Guid userId = await _utilsService.GetUserId(user);
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null)
            {
                throw new Exception("Nothing to delete");
            }

            if (idea.AuthorId != userId && !await _utilsService.HasAdminRole(user))
            {
                throw new Exception("Canot delete");
            }
            _context.Ideas.Remove(idea);
            await _context.SaveChangesAsync();
            return;

        }

        public async Task<CommentDto> AddCommentAsync(ClaimsPrincipal? user, Guid ideaId, CommentDto commentDto)
        {
            Guid userId = await _utilsService.GetUserId(user);
            if (userId == Guid.Empty)
                throw new Exception("Not authenticated");
            if (!await _context.Ideas.AnyAsync(idea => idea.Id == ideaId))
                throw new Exception("Idea does not exist");

            var comment = new Comment
            {
                Text = commentDto.Text,
                IdeaId = ideaId,
                UserId = userId
            };
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return new CommentDto(comment.Text) { Id = comment.Id, UserId = comment.UserId };
        }

        public async Task<IEnumerable<CommentDto>> GetCommentsByIdeaIdAsync(Guid ideaId)
        {
            var comments = await _context.Comments
                .AsNoTracking()
                .Where(c => c.IdeaId == ideaId)
                .ToListAsync();
            return comments.Select(comment => new CommentDto(comment.Text)
            {
                Id = comment.Id,
                UserId = comment.UserId
            });
        }

        public async Task<CommentDto?> UpdateCommentAsync(ClaimsPrincipal? user, Guid commentId, CommentDto commentDto)
        {
            Guid userId = await _utilsService.GetUserId(user);
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null)
            {
                throw new Exception("Nothing to update");
            }
            if (comment.UserId != userId && !await _utilsService.HasAdminRole(user))
                throw new Exception("You cannot update this comment");

            comment.Text = commentDto.Text;
            await _context.SaveChangesAsync();
            return new CommentDto(comment.Text) { Id = comment.Id, UserId = comment.UserId };
        }

        public async Task DeleteCommentAsync(ClaimsPrincipal? user, Guid commentId)
        {
            Guid userId = await _utilsService.GetUserId(user);
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null)
            {
                throw new Exception("Nothing to delete");
            }

            if (comment.UserId != userId && !await _utilsService.HasAdminRole(user))
            {
                throw new Exception("Canot delete");   
            }
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return;
        }
    }
}
