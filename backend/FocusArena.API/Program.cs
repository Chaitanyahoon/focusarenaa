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

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (allowedOrigins.Length == 1 && allowedOrigins[0] == "*")
        {
            // Allow any origin (temporary/dev) — SetIsOriginAllowed works with AllowCredentials
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

// Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

var app = builder.Build();

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
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<FocusArena.Infrastructure.Hubs.GameHub>("/gamehub");
app.MapControllers();

app.Run();

public partial class Program { }
