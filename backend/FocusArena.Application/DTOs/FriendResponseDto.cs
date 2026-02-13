using FocusArena.Domain.Entities;

namespace FocusArena.Application.DTOs;

public class FriendResponseDto
{
    public int Id { get; set; } // Friendship ID
    public int FriendId { get; set; } // The other user's ID
    public string Name { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int Level { get; set; }
    public FriendshipStatus Status { get; set; }
    public bool IsIncoming { get; set; } // True if the current user is the Addressee
    public DateTime SentAt { get; set; }
}
