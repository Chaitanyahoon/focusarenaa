using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GuildRaidController : ControllerBase
{
    private readonly IGuildRaidService _raidService;
    private readonly IGuildService _guildService;
    private readonly IHubContext<GameHub> _hubContext;

    public GuildRaidController(IGuildRaidService raidService, IGuildService guildService, IHubContext<GameHub> hubContext)
    {
        _raidService = raidService;
        _guildService = guildService;
        _hubContext = hubContext;
    }

    [HttpGet("{guildId}/active")]
    public async Task<ActionResult<GuildRaid>> GetActiveRaid(int guildId)
    {
        // Add member check?
        var raid = await _raidService.GetActiveRaidAsync(guildId);
        if (raid == null) return NotFound();
        return Ok(raid);
    }

    [HttpPost("start")]
    public async Task<ActionResult<GuildRaid>> StartRaid([FromBody] StartRaidDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var guild = await _guildService.GetUserGuildAsync(userId);
        
        if (guild == null || guild.LeaderId != userId) 
            return Forbid("Only Guild Leaders can start a raid.");

        try 
        {
            var raid = await _raidService.StartRaidAsync(guild.Id, dto.Title, dto.Description, dto.TotalHP, dto.BossName);
            
            // Notification
            await _hubContext.Clients.Group($"Guild_{guild.Id}").SendAsync("ReceiveSystemMessage", $"⚔️ RAID STARTED: {dto.Title}", "warning");
            await _hubContext.Clients.Group($"Guild_{guild.Id}").SendAsync("ReceiveRaidUpdate", raid.Id, raid.TotalHP, false);
            
            return Ok(raid);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("assign")]
    public async Task<ActionResult<AppTask>> AssignTask([FromBody] AssignTaskDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var guild = await _guildService.GetUserGuildAsync(userId);
        
        if (guild == null || guild.LeaderId != userId) 
            return Forbid("Only Guild Leaders can assign tasks.");

        try
        {
            var task = await _raidService.AssignRaidTaskAsync(dto.RaidId, dto.TargetUserId, dto.Title, dto.Description, dto.Difficulty);
            
            // Notification
            await _hubContext.Clients.Group($"Guild_{guild.Id}").SendAsync("ReceiveSystemMessage", $"Task Assigned: {dto.Title}", "info");
            
            return Ok(task);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class StartRaidDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? BossName { get; set; }
    public int TotalHP { get; set; }
}

public class AssignTaskDto
{
    public int RaidId { get; set; }
    public int TargetUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Difficulty { get; set; } // 0=Easy, 1=Medium, 2=Hard
}
