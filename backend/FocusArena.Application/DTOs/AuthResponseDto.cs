namespace FocusArena.Application.DTOs;

public class AuthResponseDto
{
    public required string Token { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
    public int UserId { get; set; }
    public int XP { get; set; }
    public int Level { get; set; }
    public int? GuildId { get; set; }
}
