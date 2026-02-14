using FocusArena.Application.DTOs;
using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using FocusArena.Infrastructure.Data;
using FocusArena.Infrastructure.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtTokenService _tokenService;
    private readonly IEmailService _emailService;

    public AuthController(
        ApplicationDbContext context, 
        JwtTokenService tokenService,
        IEmailService emailService)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        try
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email already registered" });
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Create new user
            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = passwordHash,
                XP = 0,
                Level = 1,
                Gold = 5000,
                StreakCount = 0,
                JoinDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _tokenService.GenerateToken(user.Id, user.Email, user.Name, user.Role);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                Name = user.Name,
                UserId = user.Id,
                XP = user.XP,
                Level = user.Level,
                GuildId = user.GuildId,
                Role = user.Role
            });
        }
        catch (Exception ex)
        {
            var errorLog = $"[{DateTime.UtcNow}] REGISTRATION ERROR: {ex.Message}\n{ex.StackTrace}\nINNER: {ex.InnerException?.Message}\n----------------------------------\n";
            await System.IO.File.AppendAllTextAsync("registration_errors.log", errorLog);
            
            Console.WriteLine($"[REGISTRATION ERROR] {ex.Message}");
            return StatusCode(500, new { message = "Registration failed: " + ex.Message, details = ex.InnerException?.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        // Find user by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Check if banned
        if (user.IsBanned)
        {
            return StatusCode(403, new { message = "Your account has been banned. Please contact support." });
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Generate JWT token
        var token = _tokenService.GenerateToken(user.Id, user.Email, user.Name, user.Role);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Name = user.Name,
            UserId = user.Id,
            XP = user.XP,
            Level = user.Level,
            GuildId = user.GuildId,
            Role = user.Role
        });
    }

    [HttpPost("request-password-reset")]
    public async Task<ActionResult> RequestPasswordReset([FromBody] PasswordResetRequestDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
        {
            // For security, usually we don't return this, but for this dev setup we might need to know
            // or just return success to avoid enumeration.
            return Ok(new { message = "If that email exists, a reset link has been sent." });
        }

        // Generate reset token
        var resetToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync();

        // ⚠️ DEMO MODE: Returning token to frontend so EmailJS can send it.
        // In production, this should NEVER be returned. The backend should send the email.
        return Ok(new { 
            message = "Reset token generated.", 
            token = resetToken, // Returning token for EmailJS
            email = user.Email 
        });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] PasswordResetDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.PasswordResetToken == dto.Token &&
                                     u.PasswordResetTokenExpiry > DateTime.UtcNow);

        if (user == null)
        {
            return BadRequest(new { message = "Invalid or expired reset token" });
        }

        // Hash new password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successful. You can now login with your new password." });
    }
}
