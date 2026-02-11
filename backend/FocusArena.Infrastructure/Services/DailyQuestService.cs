using FocusArena.Application.Interfaces; // Contains DailyQuestStatus class
using FocusArena.Domain.Entities;
using FocusArena.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.Infrastructure.Services;

public class DailyQuestService : IDailyQuestService
{
    private readonly ApplicationDbContext _context;

    public DailyQuestService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DailyQuest>> GetDailyQuestsAsync(int userId)
    {
        return await _context.DailyQuests
            .Where(dq => dq.UserId == userId && dq.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<DailyQuestDto>> GetDailyQuestsWithProgressAsync(int userId)
    {
        var today = DateTime.UtcNow.Date;
        
        // Fetch active quests
        var quests = await _context.DailyQuests
            .Where(dq => dq.UserId == userId && dq.IsActive)
            .ToListAsync();

        // Fetch logs for today
        var logs = await _context.DailyQuestLogs
            .Where(l => l.UserId == userId && l.Date == today)
            .ToListAsync();

        // Join
        return quests.Select(q =>
        {
            var log = logs.FirstOrDefault(l => l.DailyQuestId == q.Id);
            return new DailyQuestDto
            {
                Id = q.Id,
                Title = q.Title,
                Description = q.Description,
                TargetCount = q.TargetCount,
                Unit = q.Unit,
                Difficulty = q.Difficulty,
                CurrentCount = log?.CurrentCount ?? 0,
                IsCompleted = log?.IsCompleted ?? false
            };
        });
    }

    public async Task<DailyQuest> CreateDailyQuestAsync(int userId, string title, int targetCount, string unit, int difficulty)
    {
        var quest = new DailyQuest
        {
            UserId = userId,
            Title = title,
            TargetCount = targetCount,
            Unit = unit,
            Difficulty = difficulty,
            IsActive = true
        };

        _context.DailyQuests.Add(quest);
        await _context.SaveChangesAsync();
        return quest;
    }

    public async Task<DailyQuestLog> LogProgressAsync(int userId, int dailyQuestId, int count)
    {
        var today = DateTime.UtcNow.Date;
        var log = await _context.DailyQuestLogs
            .FirstOrDefaultAsync(l => l.UserId == userId && l.DailyQuestId == dailyQuestId && l.Date == today);

        if (log == null)
        {
            // Create log for today if it doesn't exist (should be handled by reset logic, but fallback here)
            log = new DailyQuestLog
            {
                UserId = userId,
                DailyQuestId = dailyQuestId,
                Date = today,
                CurrentCount = 0,
                IsCompleted = false
            };
            _context.DailyQuestLogs.Add(log);
        }

        var quest = await _context.DailyQuests.FindAsync(dailyQuestId);
        if (quest == null) throw new Exception("Quest not found");

        log.CurrentCount = count;
        if (log.CurrentCount >= quest.TargetCount && !log.IsCompleted)
        {
            log.IsCompleted = true;
            log.CompletedAt = DateTime.UtcNow;
            // Award Rewards
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                // Simple reward formula
                int baseGold = 50;
                int baseXP = 20;
                
                // Difficulty Multiplier (assuming 1-5 or similar, let's just use linear scaling)
                int multiplier = Math.Max(1, quest.Difficulty); 
                
                int goldReward = baseGold * multiplier;
                int xpReward = baseXP * multiplier;
                
                user.Gold += goldReward;
                user.XP += xpReward;
                
                // Note: We might want to trigger level up check here, but let's keep it simple for now or inject IXPService
            }
        }

        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<bool> CheckDailyResetAsync(int userId)
    {
        var today = DateTime.UtcNow.Date;
        
        // check if logs exist for today
        var hasLogs = await _context.DailyQuestLogs.AnyAsync(l => l.UserId == userId && l.Date == today);
        if (hasLogs) return false;

        // Check internal logic for yesterday's completion to apply penalty
        var yesterday = today.AddDays(-1);
        var yesterdayLogs = await _context.DailyQuestLogs
            .Where(l => l.UserId == userId && l.Date == yesterday).ToListAsync();
        
        // If user had active quests yesterday and didn't complete all of them -> Penalty
        if (yesterdayLogs.Any() && yesterdayLogs.Any(l => !l.IsCompleted))
        {
            await ApplyPenaltyAsync(userId);
        }

        // Create logs for all active quests
        var quests = await _context.DailyQuests.Where(q => q.UserId == userId && q.IsActive).ToListAsync();
        foreach (var quest in quests)
        {
            _context.DailyQuestLogs.Add(new DailyQuestLog
            {
                UserId = userId,
                DailyQuestId = quest.Id,
                Date = today,
                CurrentCount = 0,
                IsCompleted = false
            });
        }
        await _context.SaveChangesAsync();
        return true; // Reset occurred
    }

    private async Task ApplyPenaltyAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            // Penalty: Reset streak. XP deduction is too harsh for MVP? Let's just reset streak.
            // But StreakService handles global streak. 
            // We can add a "Penalty" flag to return status, or deduct HP if we add HP later.
            // For now, let's deduct 10 XP as "Penalty".
            user.XP = Math.Max(0, user.XP - 10);
            
            
            // Note: We should probably notify user about penalty.
            // We can return this info in GetDailyStatusAsync via a separate query or side effect.
        }
    }

    public async Task<DailyQuestStatus> GetDailyStatusAsync(int userId)
    {
        var today = DateTime.UtcNow.Date;
        var logs = await _context.DailyQuestLogs
            .Include(l => l.DailyQuest)
            .Where(l => l.UserId == userId && l.Date == today)
            .ToListAsync();

        if (!logs.Any()) return new DailyQuestStatus();

        return new DailyQuestStatus
        {
            TotalQuests = logs.Count,
            CompletedQuests = logs.Count(l => l.IsCompleted),
            IsAllCompleted = logs.All(l => l.IsCompleted),
            HasPenalty = false // Logic for penalty to be implemented
        };
    }
}
