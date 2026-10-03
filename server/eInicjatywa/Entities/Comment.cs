using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Comment
{
    public int Id { get; set; } 
    public int UserId { get; set; } 
    public DateTime Data { get; set; } 
    public string Text { get; set; } = string.Empty;
}