using FocusArena.Application.DTOs;
using FocusArena.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public LeaderboardController(ApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet("global")]
    public async Task<ActionResult<List<LeaderboardEntryDto>>> GetGlobalLeaderboard([FromQuery] int limit = 100)
    {
        string cacheKey = $"global_leaderboard_{limit}";
        
        if (!_cache.TryGetValue(cacheKey, out List<LeaderboardEntryDto> leaderboard))
        {
            var users = await _context.Users
                .AsNoTracking()
                .Where(u => !u.IsBanned && u.Role != "Admin")
                .OrderByDescending(u => u.XP)
                .Take(limit)
                .ToListAsync();

            leaderboard = users.Select((u, index) => new LeaderboardEntryDto
            {
                UserId = u.Id,
                Name = u.Name ?? "Unknown Hunter",
                AvatarUrl = u.AvatarUrl,
                XP = u.XP,
                Level = u.Level,
                Rank = index + 1
            })
            .ToList();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(60));

            _cache.Set(cacheKey, leaderboard, cacheOptions);
        }

        return Ok(leaderboard);
    }

    [HttpGet("weekly")]
    public async Task<ActionResult<List<LeaderboardEntryDto>>> GetWeeklyLeaderboard([FromQuery] int limit = 100)
    {
        string cacheKey = $"weekly_leaderboard_{limit}";

        if (!_cache.TryGetValue(cacheKey, out List<LeaderboardEntryDto> result))
        {
            var weekAgo = DateTime.UtcNow.AddDays(-7);

            var weeklyData = await _context.Users
                .AsNoTracking()
                .Where(u => !u.IsBanned && u.Role != "Admin")
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

            result = weeklyData.Select((item, index) => new LeaderboardEntryDto
            {
                UserId = item.User.Id,
                Name = item.User.Name,
                AvatarUrl = item.User.AvatarUrl,
                XP = item.WeeklyXP,
                Level = item.User.Level,
                Rank = index + 1
            }).ToList();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(60));

            _cache.Set(cacheKey, result, cacheOptions);
        }

        return Ok(result);
    }
}
