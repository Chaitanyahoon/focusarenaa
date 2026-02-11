using FocusArena.Application.Interfaces;

namespace FocusArena.Application.Services;

public class XPCalculationService : IXPCalculationService
{
    public int CalculateTaskXP(int baseDifficultyXP, int streakBonus = 0, bool earlyCompletion = false)
    {
        int totalXP = baseDifficultyXP;
        
        // Add streak bonus
        totalXP += streakBonus;
        
        // Bonus for early completion
        if (earlyCompletion)
        {
            totalXP += 5;
        }
        
        return totalXP;
    }

    public int GetStreakBonus(int streakCount)
    {
        // +5 XP per streak day
        return streakCount * 5;
    }

    public int GetWeeklyConsistencyBonus(int tasksCompletedThisWeek)
    {
        // Bonus if user completes at least 7 tasks in a week
        if (tasksCompletedThisWeek >= 7)
        {
            return 20;
        }
        return 0;
    }

    public int GetMissedTaskPenalty()
    {
        // -10 XP for missed tasks
        return -10;
    }
}
