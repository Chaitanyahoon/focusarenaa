using FocusArena.Domain.Enums;

namespace FocusArena.Application.DTOs;

public class CreateTaskDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public TaskCategory Category { get; set; }
    public TaskDifficulty Difficulty { get; set; }
    public DateTime? DueDate { get; set; }
    public int? EstimatedTime { get; set; }
}
