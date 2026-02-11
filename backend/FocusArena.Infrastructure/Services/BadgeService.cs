using FocusArena.Application.DTOs;
using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using FocusArena.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FocusArena.Infrastructure.Services;

public class BadgeService : IBadgeService
{
    private readonly ApplicationDbContext _context;

    public BadgeService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BadgeDto>> GetUserBadgesAsync(int userId)
    {
        var allBadges = await _context.Badges.ToListAsync();
        var userBadges = await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .ToListAsync();

        var badgeDtos = allBadges.Select(b =>
        {
            var userBadge = userBadges.FirstOrDefault(ub => ub.BadgeId == b.BadgeId);
            return new BadgeDto
            {
                BadgeId = b.BadgeId,
                Name = b.Name,
                Description = b.Description,
                IconUrl = b.IconUrl,
                IsEarned = userBadge != null,
                EarnedDate = userBadge?.EarnedDate
            };
        }).ToList();

        return badgeDtos;
    }

    public async Task<List<Badge>> CheckAndAwardBadgesAsync(User user, int tasksCompleted)
    {
        var newlyEarnedBadges = new List<Badge>();
        
        // Get all badges and user's current badges
        var allBadges = await _context.Badges.ToListAsync();
        var userBadgeIds = await _context.UserBadges
            .Where(ub => ub.UserId == user.Id)
            .Select(ub => ub.BadgeId)
            .ToListAsync();

        // Check each badge criteria
        foreach (var badge in allBadges)
        {
            // Skip if already earned
            if (userBadgeIds.Contains(badge.BadgeId))
                continue;

            bool shouldAward = false;

            // Parse criteria and check
            if (!string.IsNullOrEmpty(badge.Criteria))
            {
                try
                {
                    var criteria = JsonSerializer.Deserialize<Dictionary<string, object>>(badge.Criteria);
                    if (criteria == null) continue;

                    var type = criteria.GetValueOrDefault("type")?.ToString();

                    shouldAward = type switch
                    {
                        "task_count" => CheckTaskCount(tasksCompleted, criteria),
                        "streak" => CheckStreak(user.StreakCount, criteria),
                        "level" => CheckLevel(user.Level, criteria),
                        "time_based" => await CheckTimeBased(user.Id, criteria),
                        "early_completion" => await CheckEarlyCompletion(user.Id, criteria),
                        _ => false
                    };
                }
                catch
                {
                    // Skip badges with invalid criteria
                    continue;
                }
            }

            if (shouldAward)
            {
                // Award the badge
                var userBadge = new UserBadge
                {
                    UserId = user.Id,
                    BadgeId = badge.BadgeId,
                    EarnedDate = DateTime.UtcNow
                };

                _context.UserBadges.Add(userBadge);
                newlyEarnedBadges.Add(badge);
            }
        }

        if (newlyEarnedBadges.Any())
        {
            await _context.SaveChangesAsync();
        }

        return newlyEarnedBadges;
    }

    private bool CheckTaskCount(int tasksCompleted, Dictionary<string, object> criteria)
    {
        if (criteria.TryGetValue("value", out var valueObj))
        {
            if (int.TryParse(valueObj.ToString(), out int requiredCount))
            {
                return tasksCompleted >= requiredCount;
            }
        }
        return false;
    }

    private bool CheckStreak(int currentStreak, Dictionary<string, object> criteria)
    {
        if (criteria.TryGetValue("value", out var valueObj))
        {
            if (int.TryParse(valueObj.ToString(), out int requiredStreak))
            {
                return currentStreak >= requiredStreak;
            }
        }
        return false;
    }

    private bool CheckLevel(int currentLevel, Dictionary<string, object> criteria)
    {
        if (criteria.TryGetValue("value", out var valueObj))
        {
            if (int.TryParse(valueObj.ToString(), out int requiredLevel))
            {
                return currentLevel >= requiredLevel;
            }
        }
        return false;
    }

    private async Task<bool> CheckTimeBased(int userId, Dictionary<string, object> criteria)
    {
        // Check if user has completed any task after specified time
        if (criteria.TryGetValue("after", out var timeObj))
        {
            var afterTime = timeObj.ToString(); // e.g., "22:00"
            
            var tasksAfterTime = await _context.Tasks
                .Where(t => t.UserId == userId && 
                           t.Status == FocusArena.Domain.Enums.TaskStatus.Done &&
                           t.CompletedAt != null)
                .ToListAsync();

            return tasksAfterTime.Any(t =>
            {
                var completedTime = t.CompletedAt!.Value.TimeOfDay;
                var targetTime = TimeSpan.Parse(afterTime ?? "22:00");
                return completedTime >= targetTime;
            });
        }
        return false;
    }

    private async Task<bool> CheckEarlyCompletion(int userId, Dictionary<string, object> criteria)
    {
        // Check if user has completed tasks before deadline
        if (criteria.TryGetValue("value", out var valueObj))
        {
            if (int.TryParse(valueObj.ToString(), out int requiredCount))
            {
                var earlyCompletions = await _context.Tasks
                    .Where(t => t.UserId == userId &&
                               t.Status == FocusArena.Domain.Enums.TaskStatus.Done &&
                               t.CompletedAt != null &&
                               t.DueDate != null &&
                               t.CompletedAt < t.DueDate)
                    .CountAsync();

                return earlyCompletions >= requiredCount;
            }
        }
        return false;
    }
}
