using FocusArena.Domain.Entities;

namespace FocusArena.Application.Interfaces;

public interface IGuildRaidService
{
    Task<GuildRaid?> GetActiveRaidAsync(int guildId);
    Task<GuildRaid> StartRaidAsync(int guildId, string title, string? description, int totalHP, string? bossName);
    Task<AppTask> AssignRaidTaskAsync(int raidId, int userId, string title, string? description, int difficultyLevel); // difficultyLevel maps to params for XP calc
    Task<GuildRaid?> DamageRaidBossAsync(int raidId, int damageAmount);
}
