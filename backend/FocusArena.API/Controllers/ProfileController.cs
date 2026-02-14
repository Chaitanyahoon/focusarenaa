using FocusArena.Application.DTOs;
using FocusArena.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FocusArena.API.Controllers; // For ControllerBase
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
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = GetUserId();
        return await GetUserProfileInternal(userId, true);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileDto>> GetUserProfile(int id)
    {
        var currentUserId = GetUserId();
        // Allow viewing other profiles, but handle privacy in the internal method
        return await GetUserProfileInternal(id, id == currentUserId);
    }

    private async Task<ActionResult<UserProfileDto>> GetUserProfileInternal(int userId, bool isMe)
    {
        var user = await _context.Users
            .AsNoTracking() // Ensure fresh data
            .Include(u => u.Tasks)
            .Include(u => u.UserBadges)
            .Include(u => u.Guild)
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
            Email = isMe ? user.Email : "***", // Hide email for others
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            XP = user.XP,
            Level = user.Level,
            StreakCount = user.StreakCount,
            JoinDate = user.JoinDate,
            TotalTasksCompleted = completedTasks,
            BadgesEarned = user.UserBadges.Count,
            Gold = user.Gold,
            Theme = user.Theme,
            GuildId = user.GuildId,
            GuildId = user.GuildId,
            Role = user.Role // Important: Required for Admin session persistence
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
            // Blue is always free
            if (dto.Theme == "blue")
            {
                user.Theme = dto.Theme;
            }
            else
            {
                // Check if user owns the theme via inventory
                var ownsTheme = await _context.InventoryItems
                    .Include(i => i.ShopItem)
                    .AnyAsync(i => i.UserId == userId 
                        && i.ShopItem.Type == "Theme" 
                        && i.ShopItem.EffectData.Contains($"\"theme\":\"{dto.Theme}\"")
                        && i.Quantity > 0);

                if (!ownsTheme)
                {
                    return BadRequest(new { message = $"You don't own the '{dto.Theme}' theme. Purchase it from the Shop first!" });
                }
                user.Theme = dto.Theme;
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("owned-themes")]
    public async Task<ActionResult<List<string>>> GetOwnedThemes()
    {
        var userId = GetUserId();

        // Blue is always owned
        var ownedThemes = new List<string> { "blue" };

        var themeItems = await _context.InventoryItems
            .Include(i => i.ShopItem)
            .Where(i => i.UserId == userId && i.ShopItem.Type == "Theme" && i.Quantity > 0)
            .ToListAsync();

        foreach (var item in themeItems)
        {
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(item.ShopItem.EffectData);
                var themeName = doc.RootElement.GetProperty("theme").GetString();
                if (!string.IsNullOrEmpty(themeName))
                {
                    ownedThemes.Add(themeName);
                }
            }
            catch { }
        }

        return Ok(ownedThemes);
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
