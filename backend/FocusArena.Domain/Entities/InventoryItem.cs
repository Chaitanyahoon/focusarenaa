namespace FocusArena.Domain.Entities;

public class InventoryItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ShopItemId { get; set; }
    public int Quantity { get; set; } = 1;
    public DateTime AcquiredDate { get; set; } = DateTime.UtcNow;

    public virtual User? User { get; set; }
    public virtual ShopItem? ShopItem { get; set; }
}
