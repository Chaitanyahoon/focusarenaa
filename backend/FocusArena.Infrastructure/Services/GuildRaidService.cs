using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using FocusArena.Domain.Enums;
using FocusArena.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.Infrastructure.Services;

public class GuildRaidService : IGuildRaidService
{
    private readonly ApplicationDbContext _context;

    public GuildRaidService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GuildRaid?> GetActiveRaidAsync(int guildId)
    {
        return await _context.GuildRaids
            .Include(r => r.Tasks)
                .ThenInclude(t => t.User)
            .Where(r => r.GuildId == guildId && r.Status == GuildRaidStatus.Active)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<GuildRaid> StartRaidAsync(int guildId, string title, string? description, int totalHP, string? bossName)
    {
        var existing = await GetActiveRaidAsync(guildId);
        if (existing != null)
        {
            throw new InvalidOperationException("Guild already has an active raid.");
        }

        var raid = new GuildRaid
        {
            GuildId = guildId,
            Title = title,
            Description = description,
            TotalHP = totalHP,
            CurrentHP = totalHP,
            BossName = bossName,
            Status = GuildRaidStatus.Active
        };

        _context.GuildRaids.Add(raid);
        await _context.SaveChangesAsync();
        
        return raid;
    }

    public async Task<AppTask> AssignRaidTaskAsync(int raidId, int userId, string title, string? description, int difficultyLevel)
    {
        var raid = await _context.GuildRaids.FindAsync(raidId);
        if (raid == null || raid.Status != GuildRaidStatus.Active) throw new InvalidOperationException("Raid not found or inactive.");

        var difEnum = (TaskDifficulty)difficultyLevel; 
        
        var task = new AppTask
        {
            UserId = userId,
            Title = title,
            Description = description,
            Difficulty = difEnum,
            Category = TaskCategory.Work,
            IsGuildTask = true,
            GuildRaidId = raidId,
            Status = FocusArena.Domain.Enums.TaskStatus.ToDo
        };

        task.CalculateXPReward(); 
        
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return task;
    }

    public async Task<GuildRaid?> DamageRaidBossAsync(int raidId, int damageAmount)
    {
        var raid = await _context.GuildRaids.FindAsync(raidId);
        if (raid == null || raid.Status != GuildRaidStatus.Active) return null;

        raid.CurrentHP = Math.Max(0, raid.CurrentHP - damageAmount);
        
        if (raid.CurrentHP == 0)
        {
            raid.Status = GuildRaidStatus.Cleared;
            raid.ClearedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return raid;
    }
}
