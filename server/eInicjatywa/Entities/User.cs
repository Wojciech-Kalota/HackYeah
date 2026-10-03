using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Name { get; set; }
    public string Surname { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public District District { get; set; } = null!;
    public ICollection<Idea> AuthoredIdeas { get; set; } = new List<Idea>();
}