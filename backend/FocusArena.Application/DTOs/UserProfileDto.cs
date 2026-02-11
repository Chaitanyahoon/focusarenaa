namespace FocusArena.Application.DTOs;

public class UserProfileDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public int XP { get; set; }
    public int Level { get; set; }
    public int StreakCount { get; set; }
    public DateTime JoinDate { get; set; }
    public int TotalTasksCompleted { get; set; }
    public int BadgesEarned { get; set; }
}
