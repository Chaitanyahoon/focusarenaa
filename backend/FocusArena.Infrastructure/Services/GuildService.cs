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
        // Check if user is already in a guild
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
        
        // Update user
        user.GuildId = guild.Id;
        
        await _context.SaveChangesAsync();
        return guild;
    }

    public async Task<Guild?> GetGuildAsync(int guildId)
    {
        return await _context.Guilds
            .Include(g => g.Members)
            .ThenInclude(m => m.User) // Include user details for members
            .FirstOrDefaultAsync(g => g.Id == guildId);
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

        // If leader leaves, disband? or prevent? For now, prevent if leader.
        if (member.Role == GuildRole.Leader)
        {
            // TODO: Transfer leadership logic
            return false;
        }

        _context.GuildMembers.Remove(member);
        user.GuildId = null;

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
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars
        var random = new Random();
        return new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}
