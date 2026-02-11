using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GuildsController : ControllerBase
{
    private readonly IGuildService _guildService;

    public GuildsController(IGuildService guildService)
    {
        _guildService = guildService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Guild>>> Search([FromQuery] string query = "")
    {
        var guilds = await _guildService.SearchGuildsAsync(query);
        return Ok(guilds);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Guild>> Get(int id)
    {
        var guild = await _guildService.GetGuildAsync(id);
        if (guild == null) return NotFound();
        return Ok(guild);
    }

    [HttpPost]
    public async Task<ActionResult<Guild>> Create(CreateGuildDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var guild = await _guildService.CreateGuildAsync(userId, dto.Name, dto.Description, dto.IsPrivate, dto.InviteCode);
        
        if (guild == null) return BadRequest("Could not create guild. User may already be in a guild.");
        
        return CreatedAtAction(nameof(Get), new { id = guild.Id }, guild);
    }

    [HttpPost("{id}/join")]
    public async Task<IActionResult> Join(int id, [FromBody] JoinGuildDto? dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _guildService.JoinGuildAsync(userId, id, dto?.InviteCode);
        
        if (!result) return BadRequest("Could not join guild. Guild may be full, private (needs invite), or user already in a guild.");
        
        return Ok(new { message = "Joined guild successfully." });
    }

    [HttpPost("leave")]
    public async Task<IActionResult> Leave()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _guildService.LeaveGuildAsync(userId);
        
        if (!result) return BadRequest("Could not leave guild.");
        
        return Ok(new { message = "Left guild successfully." });
    }
}

public class CreateGuildDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPrivate { get; set; } = false;
    public string? InviteCode { get; set; }
}

public class JoinGuildDto
{
    public string? InviteCode { get; set; }
}
