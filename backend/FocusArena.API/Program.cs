using FocusArena.Application.Interfaces;
using FocusArena.Application.Services;
using FocusArena.Infrastructure.Data;
using FocusArena.Infrastructure.Identity;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Read allowed origins from env (comma-separated) or fall back to localhost
var allowedOriginsRaw = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
    ?? builder.Configuration["AppSettings:FrontendUrl"]
    ?? "http://localhost:3000";
var allowedOrigins = allowedOriginsRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

// Configure Database (MySQL) — Skipped in Testing (replaced by InMemory via WebApplicationFactory)
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
        ));
}

// Add SignalR
builder.Services.AddSignalR();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key not configured");
var issuer = jwtSettings["Issuer"] ?? "FocusArenaAPI";
var audience = jwtSettings["Audience"] ?? "FocusArenaClient";

builder.Services.AddSingleton(sp => new JwtTokenService(secretKey, issuer, audience));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Register Application Services
builder.Services.AddScoped<IXPCalculationService, XPCalculationService>();
builder.Services.AddScoped<ILevelService, LevelService>();
builder.Services.AddScoped<IStreakService, StreakService>();
builder.Services.AddScoped<IBadgeService, FocusArena.Infrastructure.Services.BadgeService>();
builder.Services.AddScoped<IEmailService, FocusArena.Infrastructure.Services.EmailService>();
builder.Services.AddScoped<IDailyQuestService, FocusArena.Infrastructure.Services.DailyQuestService>();
builder.Services.AddScoped<IShopService, FocusArena.Infrastructure.Services.ShopService>();
builder.Services.AddScoped<IGateService, FocusArena.Infrastructure.Services.GateService>();
builder.Services.AddScoped<IGuildService, FocusArena.Infrastructure.Services.GuildService>();
builder.Services.AddScoped<IGuildRaidService, FocusArena.Infrastructure.Services.GuildRaidService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            // Allow any Vercel deployment (production + preview URLs)
            if (origin.EndsWith(".vercel.app")) return true;
            // Allow localhost for development
            if (origin.Contains("localhost") || origin.Contains("127.0.0.1")) return true;
            // Allow explicit origins from env var
            return allowedOrigins.Any(o => o == "*" || o == origin);
        })
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

var app = builder.Build();

// Auto-migrate database on startup (creates tables if they don't exist)
if (!app.Environment.IsEnvironment("Testing"))
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();

        // Seed Default Admin User
        var adminEmail = "focusarenago@gmail.com";
        var existingAdmin = db.Users.FirstOrDefault(u => u.Email == adminEmail);

        if (existingAdmin == null)
        {
            var adminUser = new FocusArena.Domain.Entities.User
            {
                Name = "Focus Arena Admin",
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("focusarena@123"),
                Role = "Admin",
                Level = 100,
                XP = 0,
                Gold = 999999,
                JoinDate = DateTime.UtcNow,
                IsBanned = false,
                StreakCount = 0
            };
            db.Users.Add(adminUser);
            db.SaveChanges();
            Console.WriteLine("--> Seeded Default Admin User: focusarenago@gmail.com");
        }
        else if (existingAdmin.Role != "Admin")
        {
            // Ensure existing user is Admin
            existingAdmin.Role = "Admin";
            db.SaveChanges();
        }

        // Seed Shop Themes
        var themes = new List<FocusArena.Domain.Entities.ShopItem>
        {
            new() { Name = "Blaze Orange", Description = "A fiery orange theme for the bold.", Price = 1000, Type = "Theme", EffectData = "{\"theme\": \"orange\"}" },
            new() { Name = "Cyber Pink", Description = "A neon pink aesthetic for the future.", Price = 1000, Type = "Theme", EffectData = "{\"theme\": \"pink\"}" },
            new() { Name = "Noir Monochrome", Description = "A classic black and white look.", Price = 1500, Type = "Theme", EffectData = "{\"theme\": \"monochrome\"}" }
        };

        foreach (var theme in themes)
        {
            if (!db.ShopItems.Any(i => i.Name == theme.Name))
            {
                db.ShopItems.Add(theme);
            }
        }
        db.SaveChanges();
        Console.WriteLine("--> Seeded Shop Themes");
    }
}

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

app.UseIpRateLimiting();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}
else
{
    // Production: global exception handler (no stack traces)
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"message\":\"An internal server error occurred.\"}");
        });
    });
    // Note: HTTPS redirection not needed — Render handles SSL at the proxy level
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<FocusArena.Infrastructure.Hubs.GameHub>("/gamehub");
app.MapControllers();

app.Run();

public partial class Program { }
