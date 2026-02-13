namespace FocusArena.Application.DTOs;

public class ChatUserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
    public bool IsOnline { get; set; } // Can be hooked up to SignalR presense later
}
