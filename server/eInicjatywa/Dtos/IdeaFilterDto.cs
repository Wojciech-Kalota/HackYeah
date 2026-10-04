namespace eInicjatywa.Dtos
{
    public record IdeaFilterDto(
        List<Guid>? StatusIds = null,
        List<Guid>? DistrictIds = null,
        List<Guid>? CategoryIds = null,
        string? Name = null,
        bool AuthoredByMe = false,
        int Page = 1,
        int PageSize = 20
    );
}
