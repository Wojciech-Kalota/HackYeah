using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Comment
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Text { get; set; } = string.Empty;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid IdeaId { get; set; }
    public Idea Idea { get; set; } = null!;
}
