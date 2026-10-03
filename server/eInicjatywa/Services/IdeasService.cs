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
        Task<IEnumerable<Idea>> GetIdeasAsync();
        Task<Idea> GetIdeaByIdAsync(Guid id);
        Task<IdeaDto?> UpdateIdeaAsync(ClaimsPrincipal? user,Guid id, IdeaDto ideaDto);
        Task<bool> DeleteIdeaAsync(ClaimsPrincipal? user, Guid id);

        Task<CommentDto> AddCommentAsync(ClaimsPrincipal? user, Guid ideaId, CommentDto commentDto);
        Task<IEnumerable<Comment>> GetCommentsByIdeaIdAsync(Guid ideaId);
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

            var categories = await _context.IdeaCategories.Where
                (c => ideaDto.CategoryIds.Contains(c.CategoryId)).ToListAsync();

            var idea = new Idea
            {
                Title = ideaDto.Title,
                Description = ideaDto.Description,
                ImageUrl = ideaDto.ImageUrl,
                DistrictId = ideaDto.DistrictId,
                IdeaCategorys = categories,
                StatusId = ideaDto.StatusId,
                AuthorId = userId
            };

            _context.Ideas.Add(idea);
            await _context.SaveChangesAsync();
            return ideaDto;
        }

        public async Task<IEnumerable<Idea>> GetIdeasAsync()
        {
            var ideas = await _context.Ideas.AsNoTracking().ToListAsync();
            return ideas;
        }

        public async Task<Idea> GetIdeaByIdAsync(Guid id)
        {
            var idea = await _context.Ideas.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
            return idea;
        }

        public async Task<IdeaDto?> UpdateIdeaAsync(ClaimsPrincipal? user, Guid id, IdeaDto ideaDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteIdeaAsync(ClaimsPrincipal? user, Guid id)
        {
            Guid userId = await _utilsService.GetUserId(user);
            var idea = await _context.Ideas.FindAsync(id);

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

            var comment = new Comment
            {
                Text = commentDto.Text,
                IdeaId = ideaId,
                UserId = userId
            };
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return commentDto;
        }

        public async Task<IEnumerable<Comment>> GetCommentsByIdeaIdAsync(Guid ideaId)
        {
            return _context.Comments
                .Where(c => c.IdeaId == ideaId)
                .ToList();
        }

        public async Task<CommentDto?> UpdateCommentAsync(ClaimsPrincipal? user, Guid commentId, CommentDto commentDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteCommentAsync(ClaimsPrincipal? user, Guid commentId)
        {
            Guid userId = await _utilsService.GetUserId(user);
            var comment = await _context.Comments.FindAsync(commentId);

            if (comment.UserId == userId || await _utilsService.HasAdminRole(user))
            {
                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
    }
}
