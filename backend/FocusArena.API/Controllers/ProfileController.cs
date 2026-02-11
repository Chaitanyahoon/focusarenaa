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
public class ProfileController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProfileController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = GetUserId();

        var user = await _context.Users
            .Include(u => u.Tasks)
            .Include(u => u.UserBadges)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var completedTasks = user.Tasks.Count(t => t.Status == Domain.Enums.TaskStatus.Done);

        var profile = new UserProfileDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            XP = user.XP,
            Level = user.Level,
            StreakCount = user.StreakCount,
            JoinDate = user.JoinDate,
            TotalTasksCompleted = completedTasks,
            BadgesEarned = user.UserBadges.Count
        };

        return Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserId();

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (!string.IsNullOrEmpty(dto.Name))
        {
            user.Name = dto.Name;
        }

        if (dto.Bio != null)
        {
            user.Bio = dto.Bio;
        }

        if (dto.AvatarUrl != null)
        {
            user.AvatarUrl = dto.AvatarUrl;
        }

        if (dto.Theme != null)
        {
            user.Theme = dto.Theme;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("badges")]
    public async Task<ActionResult<List<BadgeDto>>> GetBadges()
    {
        var userId = GetUserId();

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

        return Ok(badgeDtos);
    }
}

public class UpdateProfileDto
{
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Theme { get; set; }
}
