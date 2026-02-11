namespace FocusArena.Domain.Entities;

public class ShopItem
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int Price { get; set; }
    public string? ImageUrl { get; set; }
    public string Type { get; set; } = "Consumable"; // Consumable, Cosmetic, Passive
    
    // JSON string for effect data (e.g., {"effect": "restore_hp", "value": 50})
    public string? EffectData { get; set; }
}
