namespace eInicjatywa.Dtos
{
    public record IdeaWriteDto
    (
        string Title,
        string Description,
        string? ImageUrl,
        Guid DistrictId,
        Guid StatusId,
        List<Guid> CategoryIds,
        Guid? Id = null,
        Guid? DuplicateOfId = null
    );
}
