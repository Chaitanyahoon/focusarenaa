using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FocusArena.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GatesController : ControllerBase
{
    private readonly IGateService _gateService;
    private readonly ApplicationDbContext _context;
    private readonly IProceduralGenerationService _proceduralService;

    public GatesController(IGateService gateService, ApplicationDbContext context, IProceduralGenerationService proceduralService)
    {
        _gateService = gateService;
        _context = context;
        _proceduralService = proceduralService;
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

    [HttpPost("procedural")]
    public async Task<ActionResult<Gate>> CreateProceduralGate([FromQuery] GateRank rank = GateRank.C)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        // Fetch recent tasks to seed the procedural generation
        var recentTasks = await _context.Tasks
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(10)
            .Select(t => t.Title)
            .ToListAsync();
            
        // Provide user context
        var user = await _context.Users.FindAsync(userId);
        int playerLevel = user?.Level ?? 1;

        // Generate Domain Properties
        var bossName = _proceduralService.GenerateBossNameFromKeywords(recentTasks);
        var title = $"Assault: {bossName}";
        var desc = $"A procedurally generated anomaly has appeared based on your recent activity. Defeat it.";

        // We use GateRank C by default, but it can be specified. Actually, stats are mapped in the Gate entities upon creation but GateService expects XP/Gold to be hardcoded by rank switch-case.
        // Wait! GateService.CreateGateAsync hardcodes XP/Gold! 
        // We will just let GateService determine the XP/Gold based on the Rank we feed it. The procedural service determines BossName & dynamic HP if we had HP.
        // But wait, Gate entity does not track CurrentHp by default, only BossMaxHp if we added it? Let me check Gate.cs again. 
        // Gate.cs doesn't have HP natively! It has Status, Type, BossName.
        
        var gate = await _gateService.CreateGateAsync(userId, title, desc, rank, DateTime.UtcNow.AddDays(1), bossName, "Anomaly");
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
    [Authorize(Roles = "Admin")]
    [HttpPost("admin/create-global")]
    public async Task<ActionResult> CreateGlobalGate([FromBody] CreateGlobalGateDto dto)
    {
        var gates = await _gateService.CreateGlobalGateAsync(dto.Title, dto.Description, dto.Rank, dto.Deadline, dto.BossName, dto.Type);
        return Ok(new { message = $"Created Global Gate for {gates.Count} users.", count = gates.Count });
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

public class CreateGlobalGateDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? BossName { get; set; }
    public string? Type { get; set; }
    public GateRank Rank { get; set; }
    public DateTime? Deadline { get; set; }
}
