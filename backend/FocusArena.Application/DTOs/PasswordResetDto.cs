namespace FocusArena.Application.DTOs;

public class PasswordResetRequestDto
{
    public required string Email { get; set; }
}

public class PasswordResetDto
{
    public required string Token { get; set; }
    public required string NewPassword { get; set; }
}

public class UpdateAvatarDto
{
    public required string AvatarUrl { get; set; } // Can be URL or base64
}

