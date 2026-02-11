using FocusArena.Domain.Entities;

namespace FocusArena.Application.Interfaces;

public interface IGateService
{
    Task<IEnumerable<Gate>> GetUserGatesAsync(int userId);
    Task<Gate?> GetGateAsync(int gateId);
    Task<Gate> CreateGateAsync(int userId, string title, string? description, GateRank rank, DateTime? deadline);
    Task<bool> AddTaskToGateAsync(int gateId, int taskId);
    Task<bool> CheckGateCompletionAsync(int gateId);
    Task<bool> ClaimGateRewardsAsync(int gateId, int userId);
}
