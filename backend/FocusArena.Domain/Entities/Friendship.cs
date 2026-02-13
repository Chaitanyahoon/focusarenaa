using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FocusArena.Domain.Entities;

public enum FriendshipStatus
{
    Pending = 0,
    Accepted = 1,
    Declined = 2,
    Blocked = 3
}

public class Friendship
{
    [Key]
    public int Id { get; set; }

    public int RequesterId { get; set; }
    public int AddresseeId { get; set; }

    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ActionedAt { get; set; }

    // Navigation properties
    [ForeignKey("RequesterId")]
    public virtual User? Requester { get; set; }

    [ForeignKey("AddresseeId")]
    public virtual User? Addressee { get; set; }
}
