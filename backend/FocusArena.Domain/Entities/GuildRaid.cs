using FocusArena.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FocusArena.Domain.Entities;


public class GuildRaid
{
    [Key]
    public int Id { get; set; }

    public int GuildId { get; set; }
    [ForeignKey("GuildId")]
    public virtual Guild? Guild { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public GuildRaidStatus Status { get; set; } = GuildRaidStatus.Active;

    public int TotalHP { get; set; } // Sum of all task difficulties (XP)
    public int CurrentHP { get; set; } // Starts at TotalHP, decreases as tasks complete

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClearedAt { get; set; }
    
    // Config
    [MaxLength(50)]
    public string BossName { get; set; } = "Project Boss";
    
    // Navigation
    public virtual ICollection<AppTask> Tasks { get; set; } = new List<AppTask>();
}
