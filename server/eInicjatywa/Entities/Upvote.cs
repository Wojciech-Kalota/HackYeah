using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class Upvote
{
    public int Id { get; set; } 
    public int UserId { get; set; } 
    public DateTime Data { get; set; } 
    public int Quantity { get; set; } 
}