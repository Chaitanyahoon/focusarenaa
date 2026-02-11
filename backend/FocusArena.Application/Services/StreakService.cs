using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;

namespace FocusArena.Application.Services;

public class StreakService : IStreakService
{
    public Task<int> UpdateStreakAsync(User user)
    {
        var now = DateTime.UtcNow.Date;
        var lastActive = user.LastActiveDate?.Date;

        // If never active or  more than 1 day gap, reset streak
        if (lastActive == null || (now - lastActive.Value).Days > 1)
        {
            user.StreakCount = 1;
        }
        // If last active was yesterday, increment streak
        else if ((now - lastActive.Value).Days == 1)
        {
            user.StreakCount++;
        }
        // If already active today, don't change
        // else: same day, no change

        user.LastActiveDate = now;
        return Task.FromResult(user.StreakCount);
    }

    public bool ShouldResetStreak(DateTime? lastActiveDate)
    {
        if (lastActiveDate == null) return true;
        
        var daysSinceActive = (DateTime.UtcNow.Date - lastActiveDate.Value.Date).Days;
        return daysSinceActive > 1;
    }

    public Task<Dictionary<DateTime, int>> GetStreakCalendarDataAsync(int userId, DateTime month)
    {
        // This would query the database for task completion dates
        // For now, returning empty dictionary as placeholder
        // Will be implemented in the repository layer
        var calendarData = new Dictionary<DateTime, int>();
        return Task.FromResult(calendarData);
    }
}
