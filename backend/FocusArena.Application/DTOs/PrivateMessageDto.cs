using System;

namespace FocusArena.Application.DTOs;

public class PrivateMessageDto
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatarUrl { get; set; }
    
    public int ReceiverId { get; set; }
    
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    public bool IsMe { get; set; } // Helper for frontend
}
