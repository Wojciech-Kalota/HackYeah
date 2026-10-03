using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Name { get; set; }
    public string? Surname { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }

    public Guid RoleId { get; set; }
    public Guid DistrictId { get; set; }
    public List<Guid> AuthoredIdeaIds { get; set; } = new List<Guid>();
}