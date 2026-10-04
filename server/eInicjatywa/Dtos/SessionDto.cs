namespace eInicjatywa.Dtos
{
    public record SessionDto
    (
        Guid UserId,
        DateTime CreatedAt,
        DateTime ExpiresAt,
        List<string> Roles
    );

    public record InternalSessionDto
    (
        Guid Token,
        Guid UserId,
        DateTime CreatedAt,
        DateTime ExpiresAt,
        List<string> Roles
    );
}