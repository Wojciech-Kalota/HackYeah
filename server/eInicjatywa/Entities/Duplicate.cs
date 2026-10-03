using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Duplicate
{
    public int Id { get; set; } 
    public int UserId { get; set; } 
    public DateTime Data { get; set; } 
    public string Text { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Image { get; set; } 
}