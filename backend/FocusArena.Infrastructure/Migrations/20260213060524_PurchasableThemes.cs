using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FocusArena.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PurchasableThemes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.InsertData(
                table: "ShopItems",
                columns: new[] { "Id", "Description", "EffectData", "ImageUrl", "Name", "Price", "Type" },
                values: new object[,]
                {
                    { 7, "Unlock the Blood Red system theme. Paint your interface in crimson.", "{\"effect\":\"unlock_theme\",\"theme\":\"red\"}", "https://api.dicebear.com/9.x/glass/svg?seed=red", "Blood Red Crystal", 1000, "Theme" },
                    { 8, "Unlock the Void Purple system theme. Embrace the darkness.", "{\"effect\":\"unlock_theme\",\"theme\":\"purple\"}", "https://api.dicebear.com/9.x/glass/svg?seed=purple", "Void Purple Crystal", 1500, "Theme" },
                    { 9, "Unlock the Royal Gold system theme. A king's interface.", "{\"effect\":\"unlock_theme\",\"theme\":\"gold\"}", "https://api.dicebear.com/9.x/glass/svg?seed=gold", "Royal Gold Crystal", 2000, "Theme" },
                    { 10, "Unlock the Necromancer Green theme. Toxic power awaits.", "{\"effect\":\"unlock_theme\",\"theme\":\"green\"}", "https://api.dicebear.com/9.x/glass/svg?seed=green", "Necromancer Green Crystal", 2500, "Theme" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "ShopItems",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.InsertData(
                table: "ShopItems",
                columns: new[] { "Id", "Description", "EffectData", "ImageUrl", "Name", "Price", "Type" },
                values: new object[,]
                {
                    { 1, "Restores 50% HP. Essential for survival.", "{\"effect\":\"restore_hp\",\"value\":50}", "https://api.dicebear.com/9.x/glass/svg?seed=potion1", "Health Potion", 100, "Consumable" },
                    { 2, "Restores 50% MP. Boosts mental clarity.", "{\"effect\":\"restore_mp\",\"value\":50}", "https://api.dicebear.com/9.x/glass/svg?seed=crystal1", "Mana Crystal", 100, "Consumable" },
                    { 3, "Restores your streak if you missed a day.", "{\"effect\":\"repair_streak\",\"value\":1}", "https://api.dicebear.com/9.x/glass/svg?seed=repair", "Streak Repair", 500, "Consumable" },
                    { 4, "Doubles XP gain for 1 hour.", "{\"effect\":\"xp_boost\",\"duration\":3600,\"multiplier\":2}", "https://api.dicebear.com/9.x/glass/svg?seed=xp", "XP Boost (1hr)", 300, "Consumable" }
                });
        }
    }
}
