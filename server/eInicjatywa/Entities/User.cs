using System.ComponentModel.DataAnnotations;

namespace eInicjatywa.Entities;

public class User
{
    public int Id;
    public string Imie { get; set; } = string.Empty;
    public string Nazwisko { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}