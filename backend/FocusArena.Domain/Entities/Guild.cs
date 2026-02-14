using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FocusArena.Domain.Entities;

public class Guild
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int LeaderId { get; set; } // UserId of the leader
    [ForeignKey("LeaderId")]
    public virtual User? Leader { get; set; }

    public int Level { get; set; } = 1;

    public int XP { get; set; } = 0;

    public int Capacity { get; set; } = 10; // Default capacity

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Guild Access
    public bool IsPrivate { get; set; } = false;

    [MaxLength(20)]
    public string? InviteCode { get; set; }

    // Navigation
    public virtual ICollection<GuildMember> Members { get; set; } = new List<GuildMember>();
}
