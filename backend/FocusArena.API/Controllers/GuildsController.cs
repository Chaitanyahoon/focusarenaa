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

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

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

    [HttpGet("my")]
    public async Task<ActionResult<Guild>> GetMyGuild()
    {
        var userId = GetUserId();
        var guild = await _guildService.GetUserGuildAsync(userId);
        if (guild == null) return NotFound();
        return Ok(guild);
    }

    [HttpPost]
    public async Task<ActionResult<Guild>> Create(CreateGuildDto dto)
    {
        var userId = GetUserId();
        var guild = await _guildService.CreateGuildAsync(userId, dto.Name, dto.Description, dto.IsPrivate, dto.InviteCode);
        
        if (guild == null) return BadRequest("Could not create guild. User may already be in a guild.");
        
        return CreatedAtAction(nameof(Get), new { id = guild.Id }, guild);
    }

    [HttpPost("{id}/join")]
    public async Task<IActionResult> Join(int id, [FromBody] JoinGuildDto? dto)
    {
        var userId = GetUserId();
        var result = await _guildService.JoinGuildAsync(userId, id, dto?.InviteCode);
        
        if (!result) return BadRequest("Could not join guild. Guild may be full, private (needs invite), or user already in a guild.");
        
        return Ok(new { message = "Joined guild successfully." });
    }

    [HttpPost("leave")]
    public async Task<IActionResult> Leave()
    {
        var userId = GetUserId();
        var result = await _guildService.LeaveGuildAsync(userId);
        
        if (!result) return BadRequest("Could not leave guild.");
        
        return Ok(new { message = "Left guild successfully." });
    }

    [HttpPost("{id}/kick/{targetUserId}")]
    public async Task<IActionResult> KickMember(int id, int targetUserId)
    {
        var userId = GetUserId();
        var result = await _guildService.KickMemberAsync(userId, targetUserId);
        
        if (!result) return BadRequest("Could not kick member. You may not be the guild leader.");
        
        return Ok(new { message = "Member kicked successfully." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var result = await _guildService.DeleteGuildAsync(userId, id);
        
        if (!result) return BadRequest("Could not delete guild. You may not be the guild leader.");
        
        return Ok(new { message = "Guild disbanded." });
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
