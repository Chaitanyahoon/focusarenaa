using FocusArena.Domain.Entities;
using FocusArena.Infrastructure.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.Infrastructure.Hubs;

public class GameHub : Hub
{
    private readonly ApplicationDbContext _context;

    public GameHub(ApplicationDbContext context)
    {
        _context = context;
    }

    // Send XP update to all connected clients
    public async Task BroadcastXPUpdate(int userId, string userName, int newXP, int newLevel)
    {
        await Clients.All.SendAsync("XPUpdated", new
        {
            userId,
            userName,
            xp = newXP,
            level = newLevel,
            timestamp = DateTime.UtcNow
        });
    }

    // Send level up notification to all clients
    public async Task BroadcastLevelUp(int userId, string userName, int newLevel)
    {
        await Clients.All.SendAsync("PlayerLeveledUp", new
        {
            userId,
            userName,
            level = newLevel,
            timestamp = DateTime.UtcNow
        });
    }

    // Send badge unlock notification
    public async Task BroadcastBadgeUnlock(int userId, string userName, string badgeName)
    {
        await Clients.All.SendAsync("BadgeUnlocked", new
        {
            userId,
            userName,
            badgeName,
            timestamp = DateTime.UtcNow
        });
    }

    // Group management for leaderboard updates
    public async Task JoinLeaderboardGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Leaderboard");
    }

    public async Task LeaveLeaderboardGroup()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Leaderboard");
    }

    // Guild Chat
    public async Task JoinGuildGroup(int guildId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Guild_{guildId}");
    }

    public async Task LeaveGuildGroup(int guildId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Guild_{guildId}");
    }

    public async Task SendMessageToGuild(int guildId, int userId, string userName, string message, string? avatarUrl)
    {
        await Clients.Group($"Guild_{guildId}").SendAsync("ReceiveGuildMessage", new
        {
            guildId,
            userId,
            userName,
            message,
            avatarUrl,
            timestamp = DateTime.UtcNow
        });
    }

    // Private Chat
    public async Task SendPrivateMessage(int senderId, int receiverId, string content)
    {
        // 1. Persist to Database
        var message = new PrivateMessage
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.PrivateMessages.Add(message);
        await _context.SaveChangesAsync();

        // 2. Load sender info to send full DTO
        var sender = await _context.Users.FindAsync(senderId);
        
        var messageDto = new
        {
            id = message.Id,
            senderId = message.SenderId,
            senderName = sender?.Name ?? "Unknown",
            senderAvatarUrl = sender?.AvatarUrl,
            receiverId = message.ReceiverId,
            content = message.Content,
            sentAt = message.SentAt,
            isRead = false
        };

        // 3. Send to Receiver (using User ID mapping)
        await Clients.User(receiverId.ToString()).SendAsync("ReceivePrivateMessage", messageDto);

        // 4. Send back to Sender (so it appears in their chat window accurately with ID)
        await Clients.User(senderId.ToString()).SendAsync("ReceivePrivateMessage", messageDto);
    }

    // Send leaderboard update to all clients in the group
    public async Task BroadcastLeaderboardUpdate()
    {
        await Clients.Group("Leaderboard").SendAsync("LeaderboardUpdated", new
        {
            timestamp = DateTime.UtcNow
        });
    }

    // Presence Tracking
    private static readonly System.Collections.Concurrent.ConcurrentDictionary<int, HashSet<string>> OnlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var userIdStr = Context.UserIdentifier;
        if (int.TryParse(userIdStr, out int userId))
        {
            OnlineUsers.AddOrUpdate(userId,
                _ => new HashSet<string> { Context.ConnectionId },
                (_, connections) =>
                {
                    lock (connections)
                    {
                        connections.Add(Context.ConnectionId);
                    }
                    return connections;
                });

            // Broadcast only if this is the first connection for this user
            if (OnlineUsers.TryGetValue(userId, out var connections))
            {
                bool isOnline;
                lock (connections) { isOnline = connections.Count == 1; }
                
                if (isOnline)
                {
                    await Clients.All.SendAsync("UserCameOnline", userId);
                }
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userIdStr = Context.UserIdentifier;
        if (int.TryParse(userIdStr, out int userId))
        {
            if (OnlineUsers.TryGetValue(userId, out var connections))
            {
                bool isOffline = false;
                lock (connections)
                {
                    connections.Remove(Context.ConnectionId);
                    if (connections.Count == 0)
                    {
                        isOffline = true;
                        // Clean up empty entry
                        OnlineUsers.TryRemove(userId, out _);
                    }
                }

                if (isOffline)
                {
                    await Clients.All.SendAsync("UserWentOffline", userId);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public Task<List<int>> GetOnlineUsers()
    {
        return Task.FromResult(OnlineUsers.Keys.ToList());
    }
}
