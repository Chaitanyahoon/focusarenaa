using FocusArena.Application.Interfaces;
using FocusArena.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ShopController : ControllerBase
{
    private readonly IShopService _shopService;

    public ShopController(IShopService shopService)
    {
        _shopService = shopService;
    }

    [HttpGet("items")]
    public async Task<IActionResult> GetShopItems()
    {
        var items = await _shopService.GetShopItemsAsync();
        return Ok(items);
    }

    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventory()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var inventory = await _shopService.GetInventoryAsync(userId);
        return Ok(inventory);
    }

    [HttpPost("buy/{itemId}")]
    public async Task<IActionResult> BuyItem(int itemId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _shopService.BuyItemAsync(userId, itemId);

        if (!result)
        {
            return BadRequest("Purchase failed. Not enough gold or item exists.");
        }

        return Ok(new { message = "Item purchased successfully." });
    }

    [HttpPost("use/{itemId}")]
    public async Task<IActionResult> UseItem(int itemId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var message = await _shopService.UseItemAsync(userId, itemId);
        return Ok(new { message });
    }
    [Authorize(Roles = "Admin")]
    [HttpPost("items")]
    public async Task<ActionResult> AddShopItem(CreateShopItemDto dto)
    {
        var item = await _shopService.AddShopItemAsync(dto);
        return CreatedAtAction(nameof(GetShopItems), new { id = item.Id }, item);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("items/{id}")]
    public async Task<ActionResult> UpdateShopItem(int id, CreateShopItemDto dto)
    {
        var item = await _shopService.UpdateShopItemAsync(id, dto);
        if (item == null) return NotFound("Item not found");
        return Ok(item);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("items/{id}")]
    public async Task<ActionResult> DeleteShopItem(int id)
    {
        var result = await _shopService.DeleteShopItemAsync(id);
        if (!result) return NotFound("Item not found");
        return Ok(new { message = "Item deleted successfully" });
    }
}
