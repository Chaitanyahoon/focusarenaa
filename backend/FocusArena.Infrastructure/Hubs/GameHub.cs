using Microsoft.AspNetCore.SignalR;

namespace FocusArena.Infrastructure.Hubs;

public class GameHub : Hub
{
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

    // Send leaderboard update to all clients in the group
    public async Task BroadcastLeaderboardUpdate()
    {
        await Clients.Group("Leaderboard").SendAsync("LeaderboardUpdated", new
        {
            timestamp = DateTime.UtcNow
        });
    }

    // Connection lifecycle
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
