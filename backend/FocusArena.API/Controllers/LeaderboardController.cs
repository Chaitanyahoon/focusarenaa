using FocusArena.Application.DTOs;
using FocusArena.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LeaderboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("global")]
    public async Task<ActionResult<List<LeaderboardEntryDto>>> GetGlobalLeaderboard([FromQuery] int limit = 100)
    {
        var users = await _context.Users
            .OrderByDescending(u => u.XP)
            .Take(limit)
            .ToListAsync();

        var leaderboard = users.Select((u, index) => new LeaderboardEntryDto
        {
            UserId = u.Id,
            Name = u.Name ?? "Unknown Hunter",
            AvatarUrl = u.AvatarUrl,
            XP = u.XP,
            Level = u.Level,
            Rank = index + 1
        })
        .ToList();

        return Ok(leaderboard);
    }

    [HttpGet("weekly")]
    public async Task<ActionResult<List<LeaderboardEntryDto>>> GetWeeklyLeaderboard([FromQuery] int limit = 100)
    {
        // Calculate weekly XP from tasks completed in the last 7 days
        var weekAgo = DateTime.UtcNow.AddDays(-7);

        var weeklyLeaderboard = await _context.Users
            .Select(u => new
            {
                User = u,
                WeeklyXP = u.Tasks
                    .Where(t => t.CompletedAt >= weekAgo && t.Status == Domain.Enums.TaskStatus.Done)
                    .Sum(t => t.XPReward)
            })
            .OrderByDescending(x => x.WeeklyXP)
            .Take(limit)
            .ToListAsync();

        var result = weeklyLeaderboard.Select((item, index) => new LeaderboardEntryDto
        {
            UserId = item.User.Id,
            Name = item.User.Name,
            AvatarUrl = item.User.AvatarUrl,
            XP = item.WeeklyXP,
            Level = item.User.Level,
            Rank = index + 1
        }).ToList();

        return Ok(result);
    }
}
