using FocusArena.Domain.Entities;

namespace FocusArena.Application.Interfaces;

public interface IGuildService
{
    Task<Guild?> CreateGuildAsync(int userId, string name, string? description, bool isPrivate = false, string? inviteCode = null);
    Task<Guild?> GetGuildAsync(int guildId);
    Task<Guild?> GetUserGuildAsync(int userId);
    Task<bool> JoinGuildAsync(int userId, int guildId, string? inviteCode = null);
    Task<bool> LeaveGuildAsync(int userId);
    Task<bool> KickMemberAsync(int leaderId, int targetUserId);
    Task<bool> DeleteGuildAsync(int leaderId, int guildId);
    Task<bool> ForceDisbandGuildAsync(int guildId);
    Task<List<Guild>> SearchGuildsAsync(string query);
}
