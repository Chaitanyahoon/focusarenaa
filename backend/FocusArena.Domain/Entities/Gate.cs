using FocusArena.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FocusArena.Domain.Entities;

public enum GateRank
{
    E = 0,
    D = 1,
    C = 2,
    B = 3,
    A = 4,
    S = 5
}

public enum GateStatus
{
    Active = 0,
    Cleared = 1,
    Failed = 2
}

public class Gate
{
    [Key]
    public int Id { get; set; }
    
    public int UserId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public GateRank Rank { get; set; } = GateRank.E;
    
    public GateStatus Status { get; set; } = GateStatus.Active;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? Deadline { get; set; }
    public DateTime? ClearedAt { get; set; }
    
    // Rewards (calculated or fixed based on Rank)
    public int XPReward { get; set; }
    public int GoldReward { get; set; }
    
    // Navigation
    public virtual User? User { get; set; }
    public virtual ICollection<AppTask> Tasks { get; set; } = new List<AppTask>();
}
