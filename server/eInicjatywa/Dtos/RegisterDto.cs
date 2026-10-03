namespace eInicjatywa.Dtos
{
    public record RegisterDto
    (
        string Email,
        string Password,
        string NameFirst,
        string NameLast,
        List<string> Roles
    );
}