using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FocusArena.API.Controllers; // Self-reference? No, CreateDailyQuestDto is defined in file.

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DailyQuestController : ControllerBase
{
    private readonly IDailyQuestService _dailyQuestService;

    public DailyQuestController(IDailyQuestService dailyQuestService)
    {
        _dailyQuestService = dailyQuestService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DailyQuestDto>>> GetDailyQuests()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        // Check for reset before returning
        await _dailyQuestService.CheckDailyResetAsync(userId);
        
        var quests = await _dailyQuestService.GetDailyQuestsWithProgressAsync(userId);
        return Ok(quests);
    }

    [HttpPost]
    public async Task<ActionResult<DailyQuest>> CreateDailyQuest(CreateDailyQuestDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var quest = await _dailyQuestService.CreateDailyQuestAsync(userId, dto.Title, dto.TargetCount, dto.Unit, dto.Difficulty);
        return CreatedAtAction(nameof(GetDailyQuests), new { }, quest);
    }

    [HttpPost("{id}/progress")]
    public async Task<ActionResult<DailyQuestLog>> LogProgress(int id, [FromBody] int count)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        try
        {
            var log = await _dailyQuestService.LogProgressAsync(userId, id, count);
            return Ok(log);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("status")]
    public async Task<ActionResult<DailyQuestStatus>> GetStatus()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var status = await _dailyQuestService.GetDailyStatusAsync(userId);
        return Ok(status);
    }
    [Authorize(Roles = "Admin")]
    [HttpPost("custom")]
    public async Task<ActionResult<IEnumerable<DailyQuest>>> CreateGlobalQuest([FromBody] CreateGlobalQuestDto dto)
    {
        var quests = await _dailyQuestService.CreateGlobalQuestAsync(dto.Title, dto.Description, dto.TargetCount, dto.Unit, dto.Difficulty);
        return Ok(new { message = $"Created quest for {quests.Count()} users.", count = quests.Count() });
    }
}

public class CreateDailyQuestDto
{
    public string Title { get; set; }
    public int TargetCount { get; set; }
    public string Unit { get; set; }
    public int Difficulty { get; set; }
}

public class CreateGlobalQuestDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public int TargetCount { get; set; }
    public string Unit { get; set; }
    public int Difficulty { get; set; }
}
