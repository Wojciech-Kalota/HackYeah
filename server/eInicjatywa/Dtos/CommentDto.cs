using eInicjatywa.Entities;

namespace eInicjatywa.Dtos
{
    public record CommentDto
    (
        string Text
    )
    {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
    }
}
