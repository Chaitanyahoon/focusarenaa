using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GatesController : ControllerBase
{
    private readonly IGateService _gateService;

    public GatesController(IGateService gateService)
    {
        _gateService = gateService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Gate>>> GetUserGates()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var gates = await _gateService.GetUserGatesAsync(userId);
        return Ok(gates);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Gate>> GetGate(int id)
    {
        var gate = await _gateService.GetGateAsync(id);
        if (gate == null) return NotFound();
        return Ok(gate);
    }

    [HttpPost]
    public async Task<ActionResult<Gate>> CreateGate(CreateGateDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var gate = await _gateService.CreateGateAsync(userId, dto.Title, dto.Description, dto.Rank, dto.Deadline, dto.BossName, dto.Type);
        return CreatedAtAction(nameof(GetGate), new { id = gate.Id }, gate);
    }

    [HttpPost("{id}/add-task/{taskId}")]
    public async Task<IActionResult> AddTaskToGate(int id, int taskId)
    {
        // Add ownership check ideally
        var result = await _gateService.AddTaskToGateAsync(id, taskId);
        if (!result) return BadRequest("Failed to add task to gate.");
        return Ok(new { message = "Task added to gate." });
    }

    [HttpPost("{id}/claim")]
    public async Task<IActionResult> ClaimRewards(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _gateService.ClaimGateRewardsAsync(id, userId);
        
        if (!result) return BadRequest("Cannot claim rewards. Gate not completed or already claimed.");
        
        return Ok(new { message = "Dungeon Cleared! Rewards claimed." });
    }
}

public class CreateGateDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? BossName { get; set; }
    public string? Type { get; set; }
    public GateRank Rank { get; set; }
    public DateTime? Deadline { get; set; }
}
