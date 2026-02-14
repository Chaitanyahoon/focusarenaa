using System.ComponentModel.DataAnnotations;

namespace FocusArena.Application.DTOs;

public class CreateShopItemDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Range(0, int.MaxValue)]
    public int Price { get; set; }

    public string? ImageUrl { get; set; }

    [Required]
    public string Type { get; set; } = "Consumable"; // Consumable, Cosmetic, Passive

    public string? EffectData { get; set; }
}
