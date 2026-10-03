using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Idea
{
    public int Id { get; set; }
    public string District { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Image { get; set; } = string.Empty;
    
    
}