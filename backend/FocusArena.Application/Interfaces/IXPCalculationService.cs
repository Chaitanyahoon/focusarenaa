namespace FocusArena.Application.Interfaces;

public interface IXPCalculationService
{
    int CalculateTaskXP(int baseDifficultyXP, int streakBonus = 0, bool earlyCompletion = false);
    int GetStreakBonus(int streakCount);
    int GetWeeklyConsistencyBonus(int tasksCompletedThisWeek);
    int GetMissedTaskPenalty();
}
