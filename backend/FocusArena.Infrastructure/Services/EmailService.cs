using FocusArena.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit.Net.Smtp;
using MimeKit;

namespace FocusArena.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetToken)
    {
        var resetLink = $"{_configuration["AppSettings:FrontendUrl"]}/reset-password?token={resetToken}";
        
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Focus Arena", _configuration["EmailSettings:FromEmail"]));
        message.To.Add(new MailboxAddress("", email));
        message.Subject = "🔒 Reset Your Focus Arena Password";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1120; color: #fff; padding: 40px; border: 2px solid #3b82f6;'>
                    <h1 style='color: #3b82f6; text-align: center; font-size: 28px; margin-bottom: 20px;'>🎮 FOCUS ARENA</h1>
                    <h2 style='color: #fff; text-align: center; margin-bottom: 30px;'>Password Reset Request</h2>
                    
                    <p style='color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;'>
                        A password reset was requested for your account. Click the button below to reset your password:
                    </p>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{resetLink}' 
                           style='background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>
                            RESET PASSWORD
                        </a>
                    </div>
                    
                    <p style='color: #64748b; font-size: 12px; margin-top: 30px;'>
                        This link expires in 1 hour. If you didn't request this, please ignore this email.
                    </p>
                    
                    <p style='color: #64748b; font-size: 11px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #1e293b;'>
                        Focus Arena - Gamified Productivity Platform
                    </p>
                </div>
            ",
            TextBody = $"Reset your Focus Arena password by visiting: {resetLink}\n\nThis link expires in 1 hour."
        };

        message.Body = bodyBuilder.ToMessageBody();

        // Check if SMTP settings are configured
        var smtpServer = _configuration["EmailSettings:SmtpServer"];
        var smtpUsername = _configuration["EmailSettings:Username"];
        
        // If no credentials, simulate sending (Dev Mode)
        if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(smtpUsername) || smtpUsername == "your-email@gmail.com")
        {
            _logger.LogWarning($"[DEV MODE] Email to {email} NOT sent (SMTP not configured). Content preview: {resetLink}");
            return;
        }

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(
                smtpServer,
                int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587"),
                MailKit.Security.SecureSocketOptions.StartTls
            );
            
            // ... auth & send
            await client.AuthenticateAsync(
                smtpUsername,
                _configuration["EmailSettings:Password"]
            );

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation($"Password reset email sent successfully to {email}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send password reset email to {email}");
            throw;
        }
    }

    public async Task SendWelcomeEmailAsync(string email, string name)
    {
        _logger.LogInformation($"Welcome email would be sent to {email} for {name}");
        await Task.CompletedTask;
    }

    public async Task SendLevelUpNotificationAsync(string email, string name, int newLevel)
    {
        _logger.LogInformation($"Level-up notification would be sent to {email}. {name} reached level {newLevel}!");
        await Task.CompletedTask;
    }
}
