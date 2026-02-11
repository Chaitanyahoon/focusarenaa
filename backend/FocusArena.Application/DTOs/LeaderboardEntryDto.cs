namespace FocusArena.Application.DTOs;

public class LeaderboardEntryDto
{
    public int UserId { get; set; }
    public required string Name { get; set; }
    public string? AvatarUrl { get; set; }
    public int XP { get; set; }
    public int Level { get; set; }
    public int Rank { get; set; }
}
