using FocusArena.Domain.Entities;

namespace FocusArena.Application.Interfaces;

public interface IGuildService
{
    Task<Guild?> CreateGuildAsync(int userId, string name, string? description, bool isPrivate = false, string? inviteCode = null);
    Task<Guild?> GetGuildAsync(int guildId);
    Task<bool> JoinGuildAsync(int userId, int guildId, string? inviteCode = null);
    Task<bool> LeaveGuildAsync(int userId);
    Task<List<Guild>> SearchGuildsAsync(string query);
}
