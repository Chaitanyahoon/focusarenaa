using FocusArena.Application.DTOs;
using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using FocusArena.Infrastructure.Data;
using FocusArena.Infrastructure.Hubs;
using DomainEnums = FocusArena.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IXPCalculationService _xpService;
    private readonly ILevelService _levelService;
    private readonly IStreakService _streakService;
    private readonly IBadgeService _badgeService;
    private readonly IHubContext<GameHub> _hubContext;

    public TasksController(
        ApplicationDbContext context,
        IXPCalculationService xpService,
        ILevelService levelService,
        IStreakService streakService,
        IBadgeService badgeService,
        IHubContext<GameHub> hubContext)
    {
        _context = context;
        _xpService = xpService;
        _levelService = levelService;
        _streakService = streakService;
        _badgeService = badgeService;
        _hubContext = hubContext;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskDto>>> GetTasks(
        [FromQuery] DomainEnums.TaskStatus? status = null,
        [FromQuery] DomainEnums.TaskCategory? category = null)
    {
        var userId = GetUserId();

        var query = _context.Tasks.AsNoTracking().Where(t => t.UserId == userId);

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (category.HasValue)
        {
            query = query.Where(t => t.Category == category.Value);
        }

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto
            {
                Id = t.TaskId,
                Title = t.Title,
                Description = t.Description,
                Category = t.Category,
                Difficulty = t.Difficulty,
                XPReward = t.XPReward,
                Status = t.Status,
                DueDate = t.DueDate,
                EstimatedTime = t.EstimatedTime,
                CreatedAt = t.CreatedAt,
                CompletedAt = t.CompletedAt
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskDto dto)
    {
        var userId = GetUserId();

        var task = new AppTask
        {
            UserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            Difficulty = dto.Difficulty,
            DueDate = dto.DueDate,
            EstimatedTime = dto.EstimatedTime,
            Status = DomainEnums.TaskStatus.ToDo,
            CreatedAt = DateTime.UtcNow
        };

        // Calculate XP reward based on difficulty
        task.CalculateXPReward();

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var taskDto = new TaskDto
        {
            Id = task.TaskId,
            Title = task.Title,
            Description = task.Description,
            Category = task.Category,
            Difficulty = task.Difficulty,
            XPReward = task.XPReward,
            Status = task.Status,
            DueDate = task.DueDate,
            EstimatedTime = task.EstimatedTime,
            CreatedAt = task.CreatedAt
        };

        return CreatedAtAction(nameof(GetTasks), new { id = task.TaskId }, taskDto);
    }

    [HttpPut("{id}/complete")]
    public async Task<ActionResult<object>> CompleteTask(int id)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.TaskId == id && t.UserId == userId);

        if (task == null)
        {
            return NotFound(new { message = "Task not found" });
        }

        if (task.Status == DomainEnums.TaskStatus.Done)
        {
            return BadRequest(new { message = "Task already completed" });
        }

        // Get user
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        // Update streak
        var oldStreak = user.StreakCount;
        await _streakService.UpdateStreakAsync(user);
        var streakBonus = _xpService.GetStreakBonus(user.StreakCount);

        // Check if completed early
        bool earlyCompletion = task.DueDate.HasValue && DateTime.UtcNow < task.DueDate.Value;

        // Calculate total XP
        int totalXP = _xpService.CalculateTaskXP(task.XPReward, streakBonus, earlyCompletion);

        // Update user XP
        var oldXP = user.XP;
        user.XP += totalXP;
        var oldLevel = user.Level;
        user.Level = _levelService.CalculateLevel(user.XP);
        bool leveledUp = user.Level > oldLevel;

        // Mark task as complete
        task.Status = DomainEnums.TaskStatus.Done;
        task.CompletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Check and award badges
        var tasksCompleted = await _context.Tasks
            .CountAsync(t => t.UserId == userId && t.Status == DomainEnums.TaskStatus.Done);
        
        var newBadges = await _badgeService.CheckAndAwardBadgesAsync(user, tasksCompleted);

        // Broadcast real-time updates via SignalR
        await _hubContext.Clients.All.SendAsync("XPUpdated", new
        {
            userId = user.Id,
            userName = user.Name,
            xp = user.XP,
            level = user.Level,
            timestamp = DateTime.UtcNow
        });

        if (leveledUp)
        {
            await _hubContext.Clients.All.SendAsync("PlayerLeveledUp", new
            {
                userId = user.Id,
                userName = user.Name,
                level = user.Level,
                timestamp = DateTime.UtcNow
            });
        }

        foreach (var badge in newBadges)
        {
            await _hubContext.Clients.All.SendAsync("BadgeUnlocked", new
            {
                userId = user.Id,
                userName = user.Name,
                badgeName = badge.Name,
                timestamp = DateTime.UtcNow
            });
        }

        // Notify leaderboard group to refresh
        await _hubContext.Clients.Group("Leaderboard").SendAsync("LeaderboardUpdated", new
        {
            timestamp = DateTime.UtcNow
        });

        return Ok(new
        {
            message = "Task completed successfully",
            xpEarned = totalXP,
            newXP = user.XP,
            newLevel = user.Level,
            leveledUp = leveledUp,
            streakCount = user.StreakCount,
            streakIncreased = user.StreakCount > oldStreak,
            badgesEarned = newBadges.Select(b => new { b.BadgeId, b.Name, b.Description }).ToList()
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateTask(int id, [FromBody] CreateTaskDto dto)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.TaskId == id && t.UserId == userId);

        if (task == null)
        {
            return NotFound(new { message = "Task not found" });
        }

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Category = dto.Category;
        task.Difficulty = dto.Difficulty;
        task.DueDate = dto.DueDate;
        task.EstimatedTime = dto.EstimatedTime;
        task.CalculateXPReward();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(int id)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.TaskId == id && t.UserId == userId);

        if (task == null)
        {
            return NotFound(new { message = "Task not found" });
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateTaskStatus(int id, [FromBody] DomainEnums.TaskStatus status)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.TaskId == id && t.UserId == userId);

        if (task == null)
        {
            return NotFound(new { message = "Task not found" });
        }

        task.Status = status;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
