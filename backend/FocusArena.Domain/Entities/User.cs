namespace FocusArena.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public int XP { get; set; } = 0;
    public int Level { get; set; } = 1;
    public int Gold { get; set; } = 0;
    public int StreakCount { get; set; } = 0;
    public DateTime? LastActiveDate { get; set; }
    public DateTime JoinDate { get; set; } = DateTime.UtcNow;
    public string Theme { get; set; } = "dark";

    // Password Reset
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    // Navigation properties
    public int? GuildId { get; set; }
    public virtual Guild? Guild { get; set; }

    public virtual ICollection<AppTask> Tasks { get; set; } = new List<AppTask>();
    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}
