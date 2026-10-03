using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Vote
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public bool Positive { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Guid AuthorId { get; set; }
    public Guid IdeaId { get; set; }
}