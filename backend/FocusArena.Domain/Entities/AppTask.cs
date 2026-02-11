using FocusArena.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace FocusArena.Domain.Entities;

public class AppTask
{
    public int TaskId { get; set; }
    public int UserId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public TaskCategory Category { get; set; }
    public TaskDifficulty Difficulty { get; set; }
    public int XPReward { get; set; }
    public FocusArena.Domain.Enums.TaskStatus Status { get; set; } = FocusArena.Domain.Enums.TaskStatus.ToDo;
    public DateTime? DueDate { get; set; }
    public int? EstimatedTime { get; set; } // in minutes
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    // Navigation property
    public virtual User? User { get; set; }
    
    public int? GateId { get; set; }
    [ForeignKey("GateId")]
    public virtual Gate? Gate { get; set; }

    // Calculate XP based on difficulty
    public void CalculateXPReward()
    {
        XPReward = Difficulty switch
        {
            TaskDifficulty.Easy => 10,
            TaskDifficulty.Medium => 25,
            TaskDifficulty.Hard => 50,
            _ => 10
        };
    }
}
