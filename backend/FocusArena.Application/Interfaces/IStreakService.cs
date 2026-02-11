using FocusArena.Domain.Entities;

namespace FocusArena.Application.Interfaces;

public interface IStreakService
{
    Task<int> UpdateStreakAsync(User user);
    bool ShouldResetStreak(DateTime? lastActiveDate);
    Task<Dictionary<DateTime, int>> GetStreakCalendarDataAsync(int userId, DateTime month);
}
