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
        Task<IEnumerable<IdeaDto>> GetIdeasAsync();
        Task<IdeaDto?> GetIdeaByIdAsync(Guid id);
        Task<IdeaDto?> UpdateIdeaAsync(ClaimsPrincipal? user,Guid id, IdeaDto ideaDto);
        Task<bool> DeleteIdeaAsync(ClaimsPrincipal? user, Guid id);

        Task<CommentDto> AddCommentAsync(ClaimsPrincipal? user, Guid ideaId, CommentDto commentDto);
        Task<IEnumerable<CommentDto>> GetCommentsByIdeaIdAsync(Guid ideaId);
        Task<CommentDto?> UpdateCommentAsync(ClaimsPrincipal? user, Guid commentId, CommentDto commentDto);
        Task<bool> DeleteCommentAsync(ClaimsPrincipal? user, Guid commentId);
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
                throw new UnauthorizedAccessException("Not authenticated");

            var categoryIds = ideaDto.CategoryIds
                .Append(ideaDto.CategoryId)
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            if (!await _context.Districts.AnyAsync(d => d.Id == ideaDto.DistrictId))
                throw new ArgumentException("District does not exist");
            if (!await _context.Statuses.AnyAsync(s => s.Id == ideaDto.StatusId))
                throw new ArgumentException("Status does not exist");

            var existingCategoryIds = await _context.Categories
                .Where(category => categoryIds.Contains(category.Id))
                .Select(category => category.Id)
                .ToListAsync();
            if (existingCategoryIds.Count != categoryIds.Count)
                throw new ArgumentException("One or more categories do not exist");

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
            return ToDto(idea);
        }

        public async Task<IEnumerable<IdeaDto>> GetIdeasAsync()
        {
            var ideas = await _context.Ideas
                .AsNoTracking()
                .Include(idea => idea.IdeaCategorys)
                .ToListAsync();
            return ideas.Select(ToDto);
        }

        public async Task<IdeaDto?> GetIdeaByIdAsync(Guid id)
        {
            var idea = await _context.Ideas
                .AsNoTracking()
                .Include(existingIdea => existingIdea.IdeaCategorys)
                .FirstOrDefaultAsync(existingIdea => existingIdea.Id == id);
            return idea == null ? null : ToDto(idea);
        }

        public async Task<IdeaDto?> UpdateIdeaAsync(ClaimsPrincipal? user, Guid id, IdeaDto ideaDto)
        {
            Guid userId = await _utilsService.GetUserId(user);
            var idea = await _context.Ideas
                .Include(existingIdea => existingIdea.IdeaCategorys)
                .FirstOrDefaultAsync(existingIdea => existingIdea.Id == id);
            if (idea == null) return null;
            if (idea.AuthorId != userId && !await _utilsService.HasAdminRole(user))
                throw new UnauthorizedAccessException("You cannot update this idea");

            var categoryIds = ideaDto.CategoryIds
                .Append(ideaDto.CategoryId)
                .Where(categoryId => categoryId != Guid.Empty)
                .Distinct()
                .ToList();
            if (!await _context.Districts.AnyAsync(d => d.Id == ideaDto.DistrictId))
                throw new ArgumentException("District does not exist");
            if (!await _context.Statuses.AnyAsync(s => s.Id == ideaDto.StatusId))
                throw new ArgumentException("Status does not exist");
            if (await _context.Categories.CountAsync(c => categoryIds.Contains(c.Id)) != categoryIds.Count)
                throw new ArgumentException("One or more categories do not exist");

            idea.Title = ideaDto.Title;
            idea.Description = ideaDto.Description;
            idea.ImageUrl = ideaDto.ImageUrl;
            idea.DistrictId = ideaDto.DistrictId;
            idea.StatusId = ideaDto.StatusId;
            idea.LastUpdatedAt = DateTimeOffset.UtcNow;

            _context.IdeaCategories.RemoveRange(idea.IdeaCategorys);
            idea.IdeaCategorys = categoryIds
                .Select(categoryId => new IdeaCategory { Idea = idea, CategoryId = categoryId })
                .ToList();

            await _context.SaveChangesAsync();
            return ToDto(idea);
        }

        public async Task<bool> DeleteIdeaAsync(ClaimsPrincipal? user, Guid id)
        {
            Guid userId = await _utilsService.GetUserId(user);
            var idea = await _context.Ideas.FindAsync(id);
            if (idea == null) return false;

            if (idea.AuthorId == userId || await _utilsService.HasAdminRole(user))
            {
                _context.Ideas.Remove(idea);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<CommentDto> AddCommentAsync(ClaimsPrincipal? user, Guid ideaId, CommentDto commentDto)
        {
            Guid userId = await _utilsService.GetUserId(user);
            if (userId == Guid.Empty)
                throw new UnauthorizedAccessException("Not authenticated");
            if (!await _context.Ideas.AnyAsync(idea => idea.Id == ideaId))
                throw new ArgumentException("Idea does not exist");

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
            if (comment == null) return null;
            if (comment.UserId != userId && !await _utilsService.HasAdminRole(user))
                throw new UnauthorizedAccessException("You cannot update this comment");

            comment.Text = commentDto.Text;
            await _context.SaveChangesAsync();
            return new CommentDto(comment.Text) { Id = comment.Id, UserId = comment.UserId };
        }

        public async Task<bool> DeleteCommentAsync(ClaimsPrincipal? user, Guid commentId)
        {
            Guid userId = await _utilsService.GetUserId(user);
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return false;

            if (comment.UserId == userId || await _utilsService.HasAdminRole(user))
            {
                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        private static IdeaDto ToDto(Idea idea)
        {
            var categoryIds = idea.IdeaCategorys.Select(category => category.CategoryId).ToList();
            return new IdeaDto(
                idea.Title,
                idea.Description,
                idea.ImageUrl,
                idea.DistrictId,
                categoryIds.FirstOrDefault(),
                idea.StatusId,
                idea.AuthorId,
                categoryIds)
            {
                Id = idea.Id,
                CreatedAt = idea.CreatedAt,
                LastUpdatedAt = idea.LastUpdatedAt
            };
        }
    }
}
