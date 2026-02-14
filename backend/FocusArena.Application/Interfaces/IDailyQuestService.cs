using FocusArena.Domain.Entities;

namespace FocusArena.Application.Interfaces;

public interface IDailyQuestService
{
    Task<IEnumerable<DailyQuest>> GetDailyQuestsAsync(int userId);
    Task<IEnumerable<DailyQuestDto>> GetDailyQuestsWithProgressAsync(int userId);
    Task<DailyQuest> CreateDailyQuestAsync(int userId, string title, int targetCount, string unit, int difficulty);
    Task<IEnumerable<DailyQuest>> CreateGlobalQuestAsync(string title, string description, int targetCount, string unit, int difficulty);
    Task<DailyQuestLog> LogProgressAsync(int userId, int dailyQuestId, int count);
    Task<bool> CheckDailyResetAsync(int userId);
    Task<DailyQuestStatus> GetDailyStatusAsync(int userId);
}

public class DailyQuestDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public int TargetCount { get; set; }
    public string Unit { get; set; }
    public int Difficulty { get; set; }
    public int CurrentCount { get; set; }
    public bool IsCompleted { get; set; }
}

public class DailyQuestStatus
{
    public int TotalQuests { get; set; }
    public int CompletedQuests { get; set; }
    public bool IsAllCompleted { get; set; }
    public bool HasPenalty { get; set; }
}
