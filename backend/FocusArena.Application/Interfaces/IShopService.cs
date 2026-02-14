using FocusArena.Domain.Entities;

namespace FocusArena.Application.Interfaces;

public interface IShopService
{
    Task<IEnumerable<ShopItem>> GetShopItemsAsync();
    Task<IEnumerable<InventoryItem>> GetInventoryAsync(int userId);
    Task<bool> BuyItemAsync(int userId, int itemId);
    Task<string> UseItemAsync(int userId, int itemId);
    Task<ShopItem> AddShopItemAsync(FocusArena.Application.DTOs.CreateShopItemDto dto);
    Task<ShopItem?> UpdateShopItemAsync(int id, FocusArena.Application.DTOs.CreateShopItemDto dto);
    Task<bool> DeleteShopItemAsync(int id);
}
