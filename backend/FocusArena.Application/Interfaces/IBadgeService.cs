using FocusArena.Application.DTOs;
using FocusArena.Domain.Entities;

namespace FocusArena.Application.Interfaces;

public interface IBadgeService
{
    Task<List<BadgeDto>> GetUserBadgesAsync(int userId);
    Task<List<Badge>> CheckAndAwardBadgesAsync(User user, int tasksCompleted);
}
