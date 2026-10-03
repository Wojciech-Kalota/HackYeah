using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Idea
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Title { get; set; }
    public string Description { get; set; }
    public string? ImageUrl { get; set; } = string.Empty;

    public Guid DistrictId { get; set; }
    public Guid CategoryId { get; set; }
    public Guid StatusId { get; set; }
    public Guid AuthorId { get; set; }
    public Guid OriginalId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset LastUpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public District District { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public Status Status { get; set; } = null!;
    public User Author { get; set; } = null!;

    public ICollection<Idea> DuplicateIds { get; set; } = new List<Idea>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<User> Voters { get; set; } = new List<User>();
}