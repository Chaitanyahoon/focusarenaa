using FocusArena.Application.DTOs;
using FocusArena.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AnalyticsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    // GET: api/analytics/xp-history
    [HttpGet("xp-history")]
    public async Task<ActionResult> GetXPHistory([FromQuery] int days = 30)
    {
        var userId = GetUserId();
        var cutoffDate = DateTime.UtcNow.AddDays(-days);

        // Get completed tasks with XP earned
        var tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && 
                       t.Status == FocusArena.Domain.Enums.TaskStatus.Done &&
                       t.CompletedAt >= cutoffDate)
            .OrderBy(t => t.CompletedAt)
            .Select(t => new
            {
                date = t.CompletedAt!.Value.Date,
                xp = t.XPReward
            })
            .ToListAsync();

        // Group by date and sum XP
        var xpByDate = tasks
            .GroupBy(t => t.date)
            .Select(g => new
            {
                date = g.Key,
                xpEarned = g.Sum(t => t.xp)
            })
            .OrderBy(x => x.date)
            .ToList();

        // Calculate cumulative XP
        var user = await _context.Users.FindAsync(userId);
        var currentXP = user?.XP ?? 0;
        var cumulativeData = new List<object>();
        int runningTotal = currentXP;

        // Work backwards to get historical cumulative
        for (int i = xpByDate.Count - 1; i >= 0; i--)
        {
            cumulativeData.Insert(0, new
            {
                date = xpByDate[i].date,
                xpEarned = xpByDate[i].xpEarned,
                totalXP = runningTotal
            });
            runningTotal -= xpByDate[i].xpEarned;
        }

        return Ok(new
        {
            period = $"Last {days} days",
            data = cumulativeData,
            currentXP = currentXP
        });
    }

    // GET: api/analytics/category-distribution
    [HttpGet("category-distribution")]
    public async Task<ActionResult> GetCategoryDistribution()
    {
        var userId = GetUserId();

        var distribution = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && 
                       t.Status == FocusArena.Domain.Enums.TaskStatus.Done)
            .GroupBy(t => t.Category)
            .Select(g => new
            {
                category = g.Key.ToString(),
                count = g.Count(),
                totalXP = g.Sum(t => t.XPReward)
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var total = distribution.Sum(d => d.count);

        var result = distribution.Select(d => new
        {
            d.category,
            d.count,
            d.totalXP,
            percentage = total > 0 ? (double)d.count / total * 100 : 0
        });

        return Ok(result);
    }

    // GET: api/analytics/streak-calendar
    [HttpGet("streak-calendar")]
    public async Task<ActionResult> GetStreakCalendar([FromQuery] int days = 90)
    {
        var userId = GetUserId();
        var cutoffDate = DateTime.UtcNow.Date.AddDays(-days);

        // Fetch task counts per day in ONE query using GroupBy
        // Also added AsNoTracking() for read-only optimization
        var activeDaysData = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && 
                       t.Status == FocusArena.Domain.Enums.TaskStatus.Done &&
                       t.CompletedAt >= cutoffDate)
            .GroupBy(t => t.CompletedAt!.Value.Date)
            .Select(g => new
            {
                Date = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        // Create dictionary for O(1) lookup
        var activeDaysDict = activeDaysData.ToDictionary(x => x.Date, x => x.Count);

        // Fill in gaps in memory (fast)
        var calendarData = new List<object>();
        int totalActiveDays = activeDaysData.Count;

        for (int i = 0; i < days; i++)
        {
            var date = DateTime.UtcNow.Date.AddDays(-i);
            var count = activeDaysDict.ContainsKey(date) ? activeDaysDict[date] : 0;

            calendarData.Add(new
            {
                date = date,
                taskCount = count,
                hasActivity = count > 0
            });
        }

        var user = await _context.Users.FindAsync(userId);

        return Ok(new
        {
            period = $"Last {days} days",
            currentStreak = user?.StreakCount ?? 0,
            calendar = calendarData.OrderBy(c => ((dynamic)c).date),
            totalActiveDays = totalActiveDays
        });
    }

    // GET: api/analytics/weekly-productivity
    [HttpGet("weekly-productivity")]
    public async Task<ActionResult> GetWeeklyProductivity()
    {
        var userId = GetUserId();
        var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);

        var weeklyData = new List<object>();

        for (int week = 0; week < 4; week++)
        {
            var weekStart = startOfWeek.AddDays(-7 * week);
            var weekEnd = weekStart.AddDays(7);

            var tasksCompleted = await _context.Tasks
                .AsNoTracking()
                .CountAsync(t => t.UserId == userId &&
                                t.Status == FocusArena.Domain.Enums.TaskStatus.Done &&
                                t.CompletedAt >= weekStart &&
                                t.CompletedAt < weekEnd);

            var xpEarned = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.UserId == userId &&
                           t.Status == FocusArena.Domain.Enums.TaskStatus.Done &&
                           t.CompletedAt >= weekStart &&
                           t.CompletedAt < weekEnd)
                .SumAsync(t => t.XPReward);

            weeklyData.Add(new
            {
                weekNumber = week + 1,
                weekStart = weekStart,
                weekEnd = weekEnd,
                tasksCompleted = tasksCompleted,
                xpEarned = xpEarned,
                productivityScore = CalculateProductivityScore(tasksCompleted, xpEarned)
            });
        }

        return Ok(new
        {
            period = "Last 4 weeks",
            weeks = weeklyData
        });
    }

    // GET: api/analytics/dashboard-stats
    [HttpGet("dashboard-stats")]
    public async Task<ActionResult> GetDashboardStats()
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var today = DateTime.UtcNow.Date;
        var weekAgo = today.AddDays(-7);

        var totalTasks = await _context.Tasks.CountAsync(t => t.UserId == userId);
        var completedTasks = await _context.Tasks
            .CountAsync(t => t.UserId == userId && 
                            t.Status == FocusArena.Domain.Enums.TaskStatus.Done);

        var todayTasks = await _context.Tasks
            .CountAsync(t => t.UserId == userId && 
                            t.Status == FocusArena.Domain.Enums.TaskStatus.Done &&
                            t.CompletedAt!.Value.Date == today);

        var weekTasks = await _context.Tasks
            .CountAsync(t => t.UserId == userId && 
                            t.Status == FocusArena.Domain.Enums.TaskStatus.Done &&
                            t.CompletedAt >= weekAgo);

        var badgesEarned = await _context.UserBadges.CountAsync(ub => ub.UserId == userId);

        return Ok(new
        {
            user = new
            {
                name = user.Name,
                level = user.Level,
                xp = user.XP,
                streakCount = user.StreakCount
            },
            stats = new
            {
                totalTasks,
                completedTasks,
                pendingTasks = totalTasks - completedTasks,
                completionRate = totalTasks > 0 ? (double)completedTasks / totalTasks * 100 : 0,
                todayTasks,
                weekTasks,
                badgesEarned
            }
        });
    }

    private int CalculateProductivityScore(int tasksCompleted, int xpEarned)
    {
        // Simple productivity score: weighted average
        // 40% based on task count, 60% based on XP
        var taskScore = Math.Min(tasksCompleted * 5, 40);
        var xpScore = Math.Min(xpEarned / 10, 60);
        return (int)(taskScore + xpScore);
    }
}
