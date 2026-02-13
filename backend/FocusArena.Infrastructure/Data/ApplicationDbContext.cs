using FocusArena.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<AppTask> Tasks { get; set; }
    public DbSet<Badge> Badges { get; set; }
    public DbSet<UserBadge> UserBadges { get; set; }
    public DbSet<DailyQuest> DailyQuests { get; set; }
    public DbSet<DailyQuestLog> DailyQuestLogs { get; set; }
    public DbSet<ShopItem> ShopItems { get; set; }
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<Gate> Gates { get; set; }
    public DbSet<Guild> Guilds { get; set; }
    public DbSet<GuildMember> GuildMembers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // ... existing configurations
        
        // Seed Shop Items
        modelBuilder.Entity<ShopItem>().HasData(
            new ShopItem 
            { 
                Id = 5, 
                Name = "Shadow Extract", 
                Description = "A mysterious box containing random rewards (Gold, Items, or Jackpot).", 
                Price = 500, 
                Type = "Consumable", 
                EffectData = "{\"effect\":\"random_reward\",\"pool\":\"standard\"}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=box"
            },
            new ShopItem 
            { 
                Id = 6, 
                Name = "Guild Charter", 
                Description = "Official license required to establish a new Guild.", 
                Price = 5000, 
                Type = "KeyItem", 
                EffectData = "{\"effect\":\"unlock_feature\",\"feature\":\"create_guild\"}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=charter"
            },
            new ShopItem 
            { 
                Id = 7, 
                Name = "Blood Red Crystal", 
                Description = "Unlock the Blood Red system theme. Paint your interface in crimson.", 
                Price = 1000, 
                Type = "Theme", 
                EffectData = "{\"effect\":\"unlock_theme\",\"theme\":\"red\"}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=red"
            },
            new ShopItem 
            { 
                Id = 8, 
                Name = "Void Purple Crystal", 
                Description = "Unlock the Void Purple system theme. Embrace the darkness.", 
                Price = 1500, 
                Type = "Theme", 
                EffectData = "{\"effect\":\"unlock_theme\",\"theme\":\"purple\"}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=purple"
            },
            new ShopItem 
            { 
                Id = 9, 
                Name = "Royal Gold Crystal", 
                Description = "Unlock the Royal Gold system theme. A king's interface.", 
                Price = 2000, 
                Type = "Theme", 
                EffectData = "{\"effect\":\"unlock_theme\",\"theme\":\"gold\"}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=gold"
            },
            new ShopItem 
            { 
                Id = 10, 
                Name = "Necromancer Green Crystal", 
                Description = "Unlock the Necromancer Green theme. Toxic power awaits.", 
                Price = 2500, 
                Type = "Theme", 
                EffectData = "{\"effect\":\"unlock_theme\",\"theme\":\"green\"}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=green"
            }
        );

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Theme).HasMaxLength(10);
            entity.Property(e => e.JoinDate);
        });

        // AppTask configuration
        modelBuilder.Entity<AppTask>(entity =>
        {
            entity.HasKey(e => e.TaskId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CreatedAt);

            // Foreign key relationship
            entity.HasOne(e => e.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Badge configuration
        modelBuilder.Entity<Badge>(entity =>
        {
            entity.HasKey(e => e.BadgeId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        // UserBadge configuration
        modelBuilder.Entity<UserBadge>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.BadgeId }).IsUnique();
            entity.Property(e => e.EarnedDate);

            // Foreign key relationships
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserBadges)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Badge)
                .WithMany(b => b.UserBadges)
                .HasForeignKey(e => e.BadgeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // DailyQuest configuration
        modelBuilder.Entity<DailyQuest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // DailyQuestLog configuration
        modelBuilder.Entity<DailyQuestLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.Date }); // For fast lookup of "today's logs"
            entity.HasIndex(e => new { e.DailyQuestId, e.Date }).IsUnique(); // Ensure one log per quest per day

            entity.HasOne(e => e.DailyQuest)
                .WithMany()
                .HasForeignKey(e => e.DailyQuestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Seed initial badges
        SeedBadges(modelBuilder);
    }

    private void SeedBadges(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Badge>().HasData(
            new Badge
            {
                BadgeId = 1,
                Name = "E-Rank Hunter",
                Description = "Complete your first quest. The System acknowledges you.",
                IconUrl = "/badges/e-rank-hunter.png",
                Criteria = "{\"type\":\"task_count\",\"value\":1}"
            },
            new Badge
            {
                BadgeId = 2,
                Name = "Daily Quest Master",
                Description = "Complete quests for 7 consecutive days. Discipline is power.",
                IconUrl = "/badges/daily-quest-master.png",
                Criteria = "{\"type\":\"streak\",\"value\":7}"
            },
            new Badge
            {
                BadgeId = 3,
                Name = "S-Rank Hunter",
                Description = "Complete 100 quests. You've reached the pinnacle of power.",
                IconUrl = "/badges/s-rank-hunter.png",
                Criteria = "{\"type\":\"task_count\",\"value\":100}"
            },
            new Badge
            {
                BadgeId = 4,
                Name = "Shadow Monarch",
                Description = "Complete a quest after 10 PM. The darkness is your ally.",
                IconUrl = "/badges/shadow-monarch.png",
                Criteria = "{\"type\":\"time_based\",\"after\":\"22:00\"}"
            },
            new Badge
            {
                BadgeId = 5,
                Name = "System Optimization",
                Description = "Complete 5 quests before their deadline. Efficiency is key.",
                IconUrl = "/badges/system-optimization.png",
                Criteria = "{\"type\":\"early_completion\",\"value\":5}"
            },
            new Badge
            {
                BadgeId = 6,
                Name = "Awakened One",
                Description = "Reach level 10. The System recognizes your potential.",
                IconUrl = "/badges/awakened-one.png",
                Criteria = "{\"type\":\"level\",\"value\":10}"
            },
            new Badge
            {
                BadgeId = 7,
                Name = "Hunter's Resolve",
                Description = "Maintain a 30-day quest streak. Unbreakable determination.",
                IconUrl = "/badges/hunters-resolve.png",
                Criteria = "{\"type\":\"streak\",\"value\":30}"
            }
        );
    }
}
