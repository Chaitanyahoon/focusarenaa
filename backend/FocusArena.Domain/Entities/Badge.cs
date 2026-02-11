namespace FocusArena.Domain.Entities;

public class Badge
{
    public int BadgeId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public string? Criteria { get; set; } // JSON string defining unlock criteria

    // Navigation property
    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}
