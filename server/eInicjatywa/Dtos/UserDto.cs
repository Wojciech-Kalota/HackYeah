namespace eInicjatywa.Dtos
{
    public record UserDto
    (
        Guid Id,
        string Email,
        string NameFirst,
        string NameLast,
        List<string> Roles,
        Guid? DistrictId,
        string? DistrictName
    );
}
