using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public Guid? DistrictId { get; set; } = null;
    public District? District { get; set; } = null;
    public ICollection<Idea> AuthoredIdeas { get; set; } = new List<Idea>();
}
