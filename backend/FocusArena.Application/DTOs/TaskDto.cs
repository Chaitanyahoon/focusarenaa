using FocusArena.Domain.Enums;

namespace FocusArena.Application.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public TaskCategory Category { get; set; }
    public TaskDifficulty Difficulty { get; set; }
    public int XPReward { get; set; }
    public FocusArena.Domain.Enums.TaskStatus Status { get; set; }
    public DateTime? DueDate { get; set; }
    public int? EstimatedTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
