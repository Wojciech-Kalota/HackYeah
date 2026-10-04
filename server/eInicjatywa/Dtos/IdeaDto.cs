using eInicjatywa.Entities;

namespace eInicjatywa.Dtos
{
    public record IdeaDto
    (
        string Title,
        string Description,
        string? ImageUrl,

        Guid DistrictId,
        Guid StatusId,
        Guid AuthorId,
        List<Guid> CategoryIds,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        Guid Id
    );
}
