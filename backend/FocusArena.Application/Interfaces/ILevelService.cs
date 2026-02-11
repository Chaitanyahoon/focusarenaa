namespace FocusArena.Application.Interfaces;

public interface ILevelService
{
    int CalculateLevel(int totalXP);
    int GetXPForNextLevel(int currentLevel);
    bool CheckLevelUp(int oldXP, int newXP);
}
