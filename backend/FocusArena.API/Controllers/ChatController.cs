using FocusArena.Application.DTOs;
using FocusArena.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ChatController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet("recent")]
    public async Task<ActionResult<List<ChatUserDto>>> GetRecentChats()
    {
        var userId = GetUserId();

        // Get unique users interacted with
        var sentMessages = _context.PrivateMessages
            .Where(m => m.SenderId == userId)
            .Select(m => new { OtherUserId = m.ReceiverId, Message = m, IsSent = true });

        var receivedMessages = _context.PrivateMessages
            .Where(m => m.ReceiverId == userId)
            .Select(m => new { OtherUserId = m.SenderId, Message = m, IsSent = false });

        var allInteractions = await sentMessages.Union(receivedMessages)
            .GroupBy(x => x.OtherUserId)
            .Select(g => new
            {
                UserId = g.Key,
                LastMessage = g.OrderByDescending(x => x.Message.SentAt).FirstOrDefault()
            })
            .ToListAsync();

        var userIds = allInteractions.Select(x => x.UserId).ToList();
        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => new { u.Name, u.AvatarUrl });

        var result = allInteractions.Select(x => {
            var user = users.ContainsKey(x.UserId) ? users[x.UserId] : null;
            var unread = _context.PrivateMessages.Count(m => m.SenderId == x.UserId && m.ReceiverId == userId && !m.IsRead);
            
            return new ChatUserDto
            {
                Id = x.UserId,
                Name = user?.Name ?? "Unknown",
                AvatarUrl = user?.AvatarUrl,
                LastMessage = x.LastMessage?.Message.Content,
                LastMessageTime = x.LastMessage?.Message.SentAt,
                UnreadCount = unread,
                IsOnline = false // Logic for online status can be added later
            };
        }).OrderByDescending(x => x.LastMessageTime).ToList();

        return Ok(result);
    }

    [HttpGet("history/{otherUserId}")]
    public async Task<ActionResult<List<PrivateMessageDto>>> GetConversation(int otherUserId)
    {
        var userId = GetUserId();

        var messages = await _context.PrivateMessages
            .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) || 
                       (m.SenderId == otherUserId && m.ReceiverId == userId))
            .OrderBy(m => m.SentAt)
            .Include(m => m.Sender)
            .Select(m => new PrivateMessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = m.Sender.Name,
                SenderAvatarUrl = m.Sender.AvatarUrl,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                SentAt = m.SentAt,
                IsRead = m.IsRead,
                IsMe = m.SenderId == userId
            })
            .ToListAsync();

        // Mark as read
        var unread = await _context.PrivateMessages
            .Where(m => m.SenderId == otherUserId && m.ReceiverId == userId && !m.IsRead)
            .ToListAsync();

        if (unread.Any())
        {
            foreach (var msg in unread) msg.IsRead = true;
            await _context.SaveChangesAsync();
        }

        return Ok(messages);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<ChatUserDto>>> SearchUsers([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return Ok(new List<ChatUserDto>());

        var userId = GetUserId();
        var users = await _context.Users
            .Where(u => u.Id != userId && (u.Name.Contains(query) || u.Email.Contains(query)))
            .Take(10)
            .Select(u => new ChatUserDto
            {
                Id = u.Id,
                Name = u.Name,
                AvatarUrl = u.AvatarUrl,
                IsOnline = false
            })
            .ToListAsync();

        return Ok(users);
    }
}
