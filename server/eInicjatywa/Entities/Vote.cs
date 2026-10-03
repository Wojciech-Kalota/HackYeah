using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Vote
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public bool Positive { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public User User { get; set; } = null!;
    public Idea Idea { get; set; } = null!;
}