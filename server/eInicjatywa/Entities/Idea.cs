using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Idea
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; } = string.Empty;

    public Guid? DuplicateOfId { get; set; }
    public Idea? DuplicateOf { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;

    public Guid DistrictId { get; set; }
    public District District { get; set; } = null!;
    public ICollection<IdeaCategory> IdeaCategorys { get; set; } = new List<IdeaCategory>();
    public Status Status { get; set; } = null!;
    public Guid StatusId { get; set; }
    public User Author { get; set; } = null!;
    public Guid AuthorId { get; set; }

    public ICollection<Idea> Duplicates { get; set; } = new List<Idea>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<User> Voters { get; set; } = new List<User>();
}
