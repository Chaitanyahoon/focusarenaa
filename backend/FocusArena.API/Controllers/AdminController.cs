using FocusArena.Application.DTOs;
using FocusArena.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using FocusArena.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace FocusArena.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<GameHub> _hubContext;

    public AdminController(ApplicationDbContext context, IHubContext<GameHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllUsers([FromQuery] string? search)
    {
        var query = _context.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => u.Name.Contains(search) || u.Email.Contains(search));
        }

        var users = await query
            .OrderByDescending(u => u.JoinDate)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Role,
                u.IsBanned,
                u.Level,
                u.JoinDate
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("ban/{id}")]
    public async Task<ActionResult> BanUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found");

        if (user.Role == "Admin") return BadRequest("Cannot ban an admin");

        user.IsBanned = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User {user.Name} has been banned." });
    }

    [HttpPost("unban/{id}")]
    public async Task<ActionResult> UnbanUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found");

        user.IsBanned = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User {user.Name} has been unbanned." });
    }
    
    // ⚠️ DEV TOOL: Promote a user to Admin
    // In production, this should be removed or strictly protected with a fixed API Key
    [AllowAnonymous]
    [HttpPost("promote-dev/{email}")]
    public async Task<ActionResult> PromoteToAdmin(string email, [FromQuery] string secret)
    {
        if (secret != "FocusArenaDevSecret123!") // Simple hardcoded secret for safety
            return Unauthorized("Invalid secret key.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound("User not found");

        user.Role = "Admin";
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User {user.Name} is now an Admin. Please re-login." });
    }

    [HttpPost("broadcast")]
    public async Task<IActionResult> Broadcast([FromBody] BroadcastRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Message cannot be empty.");

        await _hubContext.Clients.All.SendAsync("ReceiveSystemMessage", request.Message, request.Type);
        return Ok(new { message = "Broadcast sent successfully." });
    }

    [HttpGet("guilds")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllGuilds([FromQuery] string? search)
    {
        var query = _context.Guilds
            .Include(g => g.Leader)
            .Include(g => g.Members)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(g => g.Name.Contains(search));
        }

        var guilds = await query
            .OrderByDescending(g => g.Level)
            .ThenByDescending(g => g.Members.Count)
            .Select(g => new
            {
                g.Id,
                g.Name,
                g.Description,
                LeaderName = g.Leader.Name,
                MemberCount = g.Members.Count,
                g.Capacity,
                g.Level,
                g.IsPrivate,
                g.CreatedAt
            })
            .ToListAsync();

        return Ok(guilds);
    }

    [HttpDelete("guilds/{id}")]
    public async Task<ActionResult> ForceDisbandGuild(int id, [FromServices] FocusArena.Application.Interfaces.IGuildService guildService)
    {
        var result = await guildService.ForceDisbandGuildAsync(id);
        if (!result) return NotFound("Guild not found");

        return Ok(new { message = "Guild has been disbanded by admin." });
    }
}

public class BroadcastRequest
{
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info"; // info, success, warning, error
}
