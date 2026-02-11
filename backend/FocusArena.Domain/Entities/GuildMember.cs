using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FocusArena.Domain.Entities;

public enum GuildRole
{
    Member = 0,
    Officer = 1,
    Leader = 2
}

public class GuildMember
{
    [Key]
    public int Id { get; set; }

    public int GuildId { get; set; }
    [ForeignKey("GuildId")]
    public virtual Guild? Guild { get; set; }

    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    public GuildRole Role { get; set; } = GuildRole.Member;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public int ContributionXP { get; set; } = 0;
}
