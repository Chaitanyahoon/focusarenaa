using FocusArena.Application.DTOs;
using FocusArena.Domain.Entities;
using FocusArena.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FocusArena.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FriendController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FriendController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    // GET: api/friend
    // List confirmed friends
    [HttpGet]
    public async Task<ActionResult<List<FriendResponseDto>>> GetFriends()
    {
        var userId = GetUserId();

        var friends = await _context.Friendships
            .AsNoTracking()
            .Where(f => (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == FriendshipStatus.Accepted)
            .Include(f => f.Requester)
            .Include(f => f.Addressee)
            .Select(f => new FriendResponseDto
            {
                Id = f.Id,
                FriendId = f.RequesterId == userId ? f.AddresseeId : f.RequesterId,
                Name = f.RequesterId == userId ? f.Addressee!.Name : f.Requester!.Name,
                AvatarUrl = f.RequesterId == userId ? f.Addressee!.AvatarUrl : f.Requester!.AvatarUrl,
                Level = f.RequesterId == userId ? f.Addressee!.Level : f.Requester!.Level,
                Status = f.Status,
                IsIncoming = f.AddresseeId == userId,
                SentAt = f.CreatedAt
            })
            .ToListAsync();

        return Ok(friends);
    }

    // GET: api/friend/requests
    // List pending requests (incoming and outgoing)
    [HttpGet("requests")]
    public async Task<ActionResult<List<FriendResponseDto>>> GetRequests()
    {
        var userId = GetUserId();

        var requests = await _context.Friendships
            .AsNoTracking()
            .Where(f => (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == FriendshipStatus.Pending)
            .Include(f => f.Requester)
            .Include(f => f.Addressee)
            .Select(f => new FriendResponseDto
            {
                Id = f.Id,
                FriendId = f.RequesterId == userId ? f.AddresseeId : f.RequesterId,
                Name = f.RequesterId == userId ? f.Addressee!.Name : f.Requester!.Name,
                AvatarUrl = f.RequesterId == userId ? f.Addressee!.AvatarUrl : f.Requester!.AvatarUrl,
                Level = f.RequesterId == userId ? f.Addressee!.Level : f.Requester!.Level,
                Status = f.Status,
                IsIncoming = f.AddresseeId == userId,
                SentAt = f.CreatedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    // POST: api/friend/request/{targetUserId}
    [HttpPost("request/{targetUserId}")]
    public async Task<ActionResult> SendRequest(int targetUserId)
    {
        var userId = GetUserId();

        if (userId == targetUserId)
            return BadRequest("You cannot send a friend request to yourself.");

        var targetUser = await _context.Users.FindAsync(targetUserId);
        if (targetUser == null)
            return NotFound("User not found.");

        // Check if existing friendship or request
        var existing = await _context.Friendships
            .FirstOrDefaultAsync(f => 
                (f.RequesterId == userId && f.AddresseeId == targetUserId) ||
                (f.RequesterId == targetUserId && f.AddresseeId == userId));

        if (existing != null)
        {
            if (existing.Status == FriendshipStatus.Accepted)
                return BadRequest("You are already friends.");
            if (existing.Status == FriendshipStatus.Pending)
                return BadRequest("A pending request already exists.");
            if (existing.Status == FriendshipStatus.Blocked)
                return BadRequest("Unable to send request.");
            
            // If declined previously, we can potentially allow re-request or just error.
            // For now, let's treat declined as a soft block to prevent spam, or allow if enough time passed.
            // Simpler approach: Reactivate if declined? Or just creating a new one?
            // Let's return error for now.
             return BadRequest("Unable to send request (Status: " + existing.Status + ")");
        }

        var friendship = new Friendship
        {
            RequesterId = userId,
            AddresseeId = targetUserId,
            Status = FriendshipStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Friendships.Add(friendship);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Friend request sent." });
    }

    // POST: api/friend/respond/{requestId}
    [HttpPost("respond/{requestId}")]
    public async Task<ActionResult> RespondToRequest(int requestId, [FromQuery] bool accept)
    {
        var userId = GetUserId();

        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f => f.Id == requestId && f.AddresseeId == userId);

        if (friendship == null)
            return NotFound("Request not found or you are not the authorization recipient.");

        if (friendship.Status != FriendshipStatus.Pending)
            return BadRequest("This request has already been processed.");

        if (accept)
        {
            friendship.Status = FriendshipStatus.Accepted;
            friendship.ActionedAt = DateTime.UtcNow;
        }
        else
        {
            // If declined, we can delete it or mark as declined.
            // Deleting allows re-request immediately. Marking declined allows history.
            // Let's delete to keep it simple and allow re-requests later if they change mind.
            _context.Friendships.Remove(friendship);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = accept ? "Friend request accepted." : "Friend request declined." });
    }

    // DELETE: api/friend/{friendshipId}
    [HttpDelete("{friendshipId}")]
    public async Task<ActionResult> RemoveFriend(int friendshipId)
    {
        var userId = GetUserId();

        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f => f.Id == friendshipId && (f.RequesterId == userId || f.AddresseeId == userId));

        if (friendship == null)
            return NotFound("Friendship not found.");

        _context.Friendships.Remove(friendship);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Friend removed." });
    }
}
