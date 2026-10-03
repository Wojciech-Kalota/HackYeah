using eInicjatywa.Entities;

namespace eInicjatywa.Dtos
{
    public record IdeaDto
    (
        string Title,
        string Description,
        string? ImageUrl,

        Guid DistrictId,
        Guid CategoryId,
        Guid StatusId,
        Guid AuthorId,
        List<Guid> CategoryIds
    )
    {
        public Guid Id { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
        public DateTimeOffset LastUpdatedAt { get; init; }
    }
}
