using FocusArena.Application.Interfaces;

namespace FocusArena.Application.Services;

public class LevelService : ILevelService
{
    public int CalculateLevel(int totalXP)
    {
        // Formula: Level = floor(sqrt(TotalXP / 10))
        if (totalXP < 0) totalXP = 0;
        
        double level = Math.Floor(Math.Sqrt(totalXP / 10.0));
        return Math.Max(1, (int)level);
    }

    public int GetXPForNextLevel(int currentLevel)
    {
        // Reverse the formula: XP = (Level^2) * 10
        int nextLevel = currentLevel + 1;
        return (nextLevel * nextLevel) * 10;
    }

    public bool CheckLevelUp(int oldXP, int newXP)
    {
        int oldLevel = CalculateLevel(oldXP);
        int newLevel = CalculateLevel(newXP);
        
        return newLevel > oldLevel;
    }
}
