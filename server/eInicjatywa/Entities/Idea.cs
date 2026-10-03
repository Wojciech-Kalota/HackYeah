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
    public Guid UserId { get; set; }

    public List<Guid> Duplicates { get; set; } = new List<Guid>();
}