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
                Id = 1, 
                Name = "Health Potion", 
                Description = "Restores 50% HP. Essential for survival.", 
                Price = 100, 
                Type = "Consumable", 
                EffectData = "{\"effect\":\"restore_hp\",\"value\":50}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=potion1"
            },
            new ShopItem 
            { 
                Id = 2, 
                Name = "Mana Crystal", 
                Description = "Restores 50% MP. Boosts mental clarity.", 
                Price = 100, 
                Type = "Consumable", 
                EffectData = "{\"effect\":\"restore_mp\",\"value\":50}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=crystal1"
            },
            new ShopItem 
            { 
                Id = 3, 
                Name = "Streak Repair", 
                Description = "Restores your streak if you missed a day.", 
                Price = 500, 
                Type = "Consumable", 
                EffectData = "{\"effect\":\"repair_streak\",\"value\":1}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=repair"
            },
            new ShopItem 
            { 
                Id = 4, 
                Name = "XP Boost (1hr)", 
                Description = "Doubles XP gain for 1 hour.", 
                Price = 300, 
                Type = "Consumable", 
                EffectData = "{\"effect\":\"xp_boost\",\"duration\":3600,\"multiplier\":2}",
                ImageUrl = "https://api.dicebear.com/9.x/glass/svg?seed=xp"
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
            entity.Property(e => e.Theme).HasMaxLength(10).HasDefaultValue("dark");
            entity.Property(e => e.JoinDate).HasDefaultValueSql("GETUTCDATE()");
        });

        // AppTask configuration
        modelBuilder.Entity<AppTask>(entity =>
        {
            entity.HasKey(e => e.TaskId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

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
            entity.Property(e => e.EarnedDate).HasDefaultValueSql("GETUTCDATE()");

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
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

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
