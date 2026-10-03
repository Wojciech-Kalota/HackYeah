using eInicjatywa.Data;
using eInicjatywa.Dtos;
using eInicjatywa.Entities;
using Microsoft.EntityFrameworkCore;

namespace eInicjatywa.Services
{
    public interface IIdeasService
    {
        Task<IdeaDto> CreateIdeaAsync(IdeaDto ideaDto);
        Task<IEnumerable<IdeaDto>> GetIdeasAsync();
        Task<IdeaDto?> GetIdeaByIdAsync(Guid id);
        Task<IdeaDto?> UpdateIdeaAsync(Guid id, IdeaDto ideaDto);
        Task<bool> DeleteIdeaAsync(Guid id);

        Task<CommentDto> AddCommentAsync(Guid ideaId, CommentDto commentDto);
        Task<IEnumerable<CommentDto>> GetCommentsByIdeaIdAsync(Guid ideaId);
        Task<CommentDto?> UpdateCommentAsync(Guid commentId, CommentDto commentDto);
        Task<bool> DeleteCommentAsync(Guid commentId);
    }

    public class IdeasService : IIdeasService
    {
        private readonly AppDbContext _context;

        public IdeasService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IdeaDto> CreateIdeaAsync(IdeaDto ideaDto)
        {
            var idea = new Idea
            {
                Title = ideaDto.Title,
                Description = ideaDto.Description,
                ImageUrl = ideaDto.ImageUrl,
                DistrictId = ideaDto.DistrictId,
                CategoryId = ideaDto.CategoryId,
                StatusId = ideaDto.StatusId,
                AuthorId = ideaDto.AuthorId
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

        public async Task<IdeaDto?> GetIdeaByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IdeaDto?> UpdateIdeaAsync(Guid id, IdeaDto ideaDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteIdeaAsync(Guid id)
        {
            throw new NotImplementedException();
        }



        public async Task<CommentDto> AddCommentAsync(Guid ideaId, CommentDto commentDto)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<CommentDto>> GetCommentsByIdeaIdAsync(Guid ideaId)
        {
            throw new NotImplementedException();
        }

        public async Task<CommentDto?> UpdateCommentAsync(Guid commentId, CommentDto commentDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteCommentAsync(Guid commentId)
        {
            throw new NotImplementedException();
        }
    }
}
