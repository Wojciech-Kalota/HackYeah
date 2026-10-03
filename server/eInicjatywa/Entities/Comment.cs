using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Comment
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Text { get; set; }

    public Guid AuthorId { get; set; }
    public Guid IdeaId { get; set; }
}