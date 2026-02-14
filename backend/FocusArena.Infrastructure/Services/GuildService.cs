using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using FocusArena.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.Infrastructure.Services;

public class GuildService : IGuildService
{
    private readonly ApplicationDbContext _context;

    public GuildService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guild?> CreateGuildAsync(int userId, string name, string? description, bool isPrivate = false, string? inviteCode = null)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.GuildId.HasValue) return null;

        var guild = new Guild
        {
            Name = name,
            Description = description,
            LeaderId = userId,
            CreatedAt = DateTime.UtcNow,
            Capacity = 10,
            IsPrivate = isPrivate,
            InviteCode = isPrivate ? (inviteCode ?? GenerateInviteCode()) : null
        };

        _context.Guilds.Add(guild);
        await _context.SaveChangesAsync();

        // Add creator as Leader
        var member = new GuildMember
        {
            GuildId = guild.Id,
            UserId = userId,
            Role = GuildRole.Leader,
            JoinedAt = DateTime.UtcNow
        };

        _context.GuildMembers.Add(member);
        user.GuildId = guild.Id;

        await _context.SaveChangesAsync();
        return guild;
    }

    public async Task<Guild?> GetGuildAsync(int guildId)
    {
        return await _context.Guilds
            .Include(g => g.Members)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(g => g.Id == guildId);
    }

    public async Task<Guild?> GetUserGuildAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.GuildId.HasValue) return null;

        return await GetGuildAsync(user.GuildId.Value);
    }

    public async Task<bool> JoinGuildAsync(int userId, int guildId, string? inviteCode = null)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.GuildId.HasValue) return false;

        var guild = await _context.Guilds.Include(g => g.Members).FirstOrDefaultAsync(g => g.Id == guildId);
        if (guild == null) return false;

        // Check invite code for private guilds
        if (guild.IsPrivate && guild.InviteCode != inviteCode)
        {
            return false;
        }

        if (guild.Members.Count >= guild.Capacity) return false;

        var member = new GuildMember
        {
            GuildId = guildId,
            UserId = userId,
            Role = GuildRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        _context.GuildMembers.Add(member);
        user.GuildId = guildId;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> LeaveGuildAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.GuildId.HasValue) return false;

        var member = await _context.GuildMembers
            .FirstOrDefaultAsync(m => m.UserId == userId && m.GuildId == user.GuildId);

        if (member == null) return false;

        // If leader, transfer leadership to oldest member or disband
        if (member.Role == GuildRole.Leader)
        {
            var guild = await _context.Guilds
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.Id == user.GuildId);

            if (guild == null) return false;

            var otherMembers = guild.Members.Where(m => m.UserId != userId).OrderBy(m => m.JoinedAt).ToList();

            if (otherMembers.Any())
            {
                // Transfer leadership to the oldest remaining member
                var newLeader = otherMembers.First();
                newLeader.Role = GuildRole.Leader;
                guild.LeaderId = newLeader.UserId;
            }
            else
            {
                // No other members, disband the guild
                _context.Guilds.Remove(guild);
            }
        }

        _context.GuildMembers.Remove(member);
        user.GuildId = null;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> KickMemberAsync(int leaderId, int targetUserId)
    {
        // Verify the requester is the guild leader
        var leader = await _context.Users.FindAsync(leaderId);
        if (leader == null || !leader.GuildId.HasValue) return false;

        var leaderMember = await _context.GuildMembers
            .FirstOrDefaultAsync(m => m.UserId == leaderId && m.GuildId == leader.GuildId);
        if (leaderMember == null || leaderMember.Role != GuildRole.Leader) return false;

        // Can't kick yourself
        if (leaderId == targetUserId) return false;

        // Find the target member in the same guild
        var targetMember = await _context.GuildMembers
            .FirstOrDefaultAsync(m => m.UserId == targetUserId && m.GuildId == leader.GuildId);
        if (targetMember == null) return false;

        // Remove the member
        var targetUser = await _context.Users.FindAsync(targetUserId);
        if (targetUser != null)
        {
            targetUser.GuildId = null;
        }

        _context.GuildMembers.Remove(targetMember);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteGuildAsync(int leaderId, int guildId)
    {
        var guild = await _context.Guilds
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.Id == guildId);

        if (guild == null || guild.LeaderId != leaderId) return false;

        // Clear GuildId for all members
        var memberUserIds = guild.Members.Select(m => m.UserId).ToList();
        var users = await _context.Users.Where(u => memberUserIds.Contains(u.Id)).ToListAsync();
        foreach (var u in users)
        {
            u.GuildId = null;
        }

        // Remove all members
        _context.GuildMembers.RemoveRange(guild.Members);

        // Remove guild
        _context.Guilds.Remove(guild);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ForceDisbandGuildAsync(int guildId)
    {
        var guild = await _context.Guilds
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.Id == guildId);

        if (guild == null) return false;

        // Clear GuildId for all members
        var memberUserIds = guild.Members.Select(m => m.UserId).ToList();
        var users = await _context.Users.Where(u => memberUserIds.Contains(u.Id)).ToListAsync();
        foreach (var u in users)
        {
            u.GuildId = null;
        }

        // Remove all members
        _context.GuildMembers.RemoveRange(guild.Members);

        // Remove guild
        _context.Guilds.Remove(guild);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Guild>> SearchGuildsAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return await _context.Guilds
                .Include(g => g.Members)
                .OrderByDescending(g => g.Level)
                .Take(10)
                .ToListAsync();
        }

        return await _context.Guilds
            .Include(g => g.Members)
            .Where(g => g.Name.Contains(query))
            .Take(20)
            .ToListAsync();
    }

    private string GenerateInviteCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}
