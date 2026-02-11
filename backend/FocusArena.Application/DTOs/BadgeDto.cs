namespace FocusArena.Application.DTOs;

public class BadgeDto
{
    public int BadgeId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public DateTime? EarnedDate { get; set; }
    public bool IsEarned { get; set; }
}
