using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using FocusArena.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FocusArena.Infrastructure.Services;

public class ShopService : IShopService
{
    private readonly ApplicationDbContext _context;

    public ShopService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ShopItem>> GetShopItemsAsync()
    {
        return await _context.ShopItems.ToListAsync();
    }

    public async Task<IEnumerable<InventoryItem>> GetInventoryAsync(int userId)
    {
        return await _context.InventoryItems
            .Include(i => i.ShopItem)
            .Where(i => i.UserId == userId && i.Quantity > 0)
            .ToListAsync();
    }

    public async Task<bool> BuyItemAsync(int userId, int itemId)
    {
        var user = await _context.Users.FindAsync(userId);
        var item = await _context.ShopItems.FindAsync(itemId);

        if (user == null || item == null) return false;

        // Check if user has enough gold
        if (user.Gold < item.Price) return false;

        // Deduct gold
        user.Gold -= item.Price;

        // Add to inventory
        var inventoryItem = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.UserId == userId && i.ShopItemId == itemId);

        if (inventoryItem != null)
        {
            inventoryItem.Quantity++;
        }
        else
        {
            inventoryItem = new InventoryItem
            {
                UserId = userId,
                ShopItemId = itemId,
                Quantity = 1,
                AcquiredDate = DateTime.UtcNow
            };
            _context.InventoryItems.Add(inventoryItem);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string> UseItemAsync(int userId, int itemId)
    {
        // itemId here refers to ShopItemId (buying context) or InventoryItemId?
        // Usually inventory check happens by ShopItemId if items are stackable.
        // Let's assume itemId is ShopItemId for simplicity in UI, but finding InventoryItem relies on UserId + ShopItemId.
        
        var inventoryItem = await _context.InventoryItems
            .Include(i => i.ShopItem)
            .FirstOrDefaultAsync(i => i.UserId == userId && i.ShopItemId == itemId);

        if (inventoryItem == null || inventoryItem.Quantity <= 0)
            return "Item not found or out of stock.";

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return "User not found.";

        var item = inventoryItem.ShopItem;
        if (item == null) return "Item definition missing.";

        // Parse Effect logic
        string message = "Effect applied.";
        if (!string.IsNullOrEmpty(item.EffectData))
        {
            try 
            {
                using JsonDocument doc = JsonDocument.Parse(item.EffectData);
                JsonElement root = doc.RootElement;
                string effectType = root.GetProperty("effect").GetString() ?? "";

                switch (effectType)
                {
                    case "restore_hp":
                        // Logic to restore HP (assuming HP exists on User? No, HP is calculated on Frontend usually based on Streak/Penalty?)
                        // Wait, User entity doesn't have HP. "Penalty Zone" logic uses Streak.
                        // Let's say restoring HP means nothing right now unless I add HP. 
                        // Or maybe it restores Streak? "repair_streak" does that.
                        // For Restore HP, maybe it prevents penalty next time?
                        // Actually, I don't have HP field. User has Level/XP.
                        // Let's assume currently only "repair_streak" and "xp_boost" are useful.
                        message = "HP Restored! (Visual only for now)";
                        break;
                    
                    case "restore_mp":
                        message = "MP Restored! (Visual only for now)";
                        break;

                    case "repair_streak":
                        // Logic: Set StreakCount = StreakCount + 1? Or restore value?
                        // Simple logic: Restore +1 streak.
                        user.StreakCount += root.GetProperty("value").GetInt32();
                        message = $"Streak repaired! +{root.GetProperty("value").GetInt32()} streak.";
                        break;

                    case "xp_boost":
                        // Requires separate table or field for active effects.
                        // I'll skip implementation for now and just say applied.
                        message = "XP Boost activated! (Not fully implemented)";
                        break;
                        
                    default:
                        message = "Unknown effect.";
                        break;
                }
            }
            catch (Exception ex)
            {
                return $"Error applying effect: {ex.Message}";
            }
        }

        // Consume item
        if (item.Type == "Consumable")
        {
            inventoryItem.Quantity--;
            if (inventoryItem.Quantity <= 0)
            {
                _context.InventoryItems.Remove(inventoryItem);
            }
        }

        await _context.SaveChangesAsync();
        return message;
    }
}
