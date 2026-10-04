namespace eInicjatywa.Dtos
{
    public record IdeaFilterDto(
        List<Guid>? StatusIds,
        List<Guid>? DistrictIds,
        List<Guid>? CategoryIds,
        string? Name,
        bool UpVotedByMe,
        bool AuthoredByMe,
        int Page = 1,
        int PageSize = 20
    );
}
