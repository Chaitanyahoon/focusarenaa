namespace FocusArena.Application.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetToken);
    Task SendWelcomeEmailAsync(string email, string name);
    Task SendLevelUpNotificationAsync(string email, string name, int newLevel);
}
