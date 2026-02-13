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
                    case "unlock_theme":
                        var themeName = root.GetProperty("theme").GetString() ?? "";
                        user.Theme = themeName;
                        message = $"Theme '{themeName}' activated! Your system has been updated.";
                        // Theme items are NOT consumed - they stay as proof of ownership
                        break;

                    case "unlock_feature":
                        message = "Feature unlocked! System recognizes your authority.";
                        break;

                    case "random_reward":
                        var rand = new Random();
                        int roll = rand.Next(1, 101);
                        
                        if (roll <= 50)
                        {
                            int goldReward = rand.Next(150, 401);
                            user.Gold += goldReward;
                            message = $"You found {goldReward} Gold!";
                        }
                        else if (roll <= 80)
                        {
                            int goldReward = rand.Next(600, 1001);
                            user.Gold += goldReward;
                            message = $"Lucky! You found {goldReward} Gold!";
                        }
                        else if (roll <= 95)
                        {
                            user.Gold += 1000;
                            message = "Rare find! You got 1000 Gold!";
                        }
                        else
                        {
                            user.Gold += 2500;
                            message = "JACKPOT!! You found 2500 Gold in the shadows!";
                        }
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

        // Consume item only if Consumable type
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
