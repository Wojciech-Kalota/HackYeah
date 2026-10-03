using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class UserRole
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; } 
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Role> Roles { get; set; } = new List<Role>();
}